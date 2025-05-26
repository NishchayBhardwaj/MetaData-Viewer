from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField
import json
from typing import Dict, List, Any
import os
from datetime import datetime
import glob
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MetadataReader:
    def __init__(self):
        self.spark = SparkSession.builder \
            .appName("Metastore Viewer") \
            .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
            .config("spark.hadoop.fs.s3a.access.key", os.getenv('AWS_ACCESS_KEY_ID')) \
            .config("spark.hadoop.fs.s3a.secret.key", os.getenv('AWS_SECRET_ACCESS_KEY')) \
            .config("spark.hadoop.fs.s3a.endpoint", f"s3.{os.getenv('AWS_REGION')}.amazonaws.com") \
            .config("spark.hadoop.fs.s3a.aws.credentials.provider", "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider") \
            .config("spark.hadoop.fs.s3a.path.style.access", "true") \
            .config("spark.hadoop.fs.s3a.impl.disable.cache", "true") \
            .config("spark.jars.packages", 
                   "org.apache.hadoop:hadoop-aws:3.3.4,"
                   "com.amazonaws:aws-java-sdk-bundle:1.12.367,"
                   "org.apache.hadoop:hadoop-client:3.3.4,"
                   "org.apache.hadoop:hadoop-common:3.3.4,"
                   "io.delta:delta-core_2.12:2.4.0,"
                   "org.apache.iceberg:iceberg-spark-runtime-3.4_2.12:1.4.3,"
                   "org.apache.hudi:hudi-spark3.4-bundle_2.12:0.14.0,"
                   "com.fasterxml.jackson.core:jackson-core:2.15.2,"
                   "com.fasterxml.jackson.core:jackson-databind:2.15.2,"
                   "com.fasterxml.jackson.core:jackson-annotations:2.15.2,"
                   "com.fasterxml.jackson.module:jackson-module-scala_2.12:2.15.2") \
            .config("spark.jars.excludes", 
                   "com.fasterxml.jackson.core:jackson-databind,"
                   "com.fasterxml.jackson.core:jackson-core,"
                   "com.fasterxml.jackson.core:jackson-annotations,"
                   "com.fasterxml.jackson.module:jackson-module-scala_2.12") \
            .config("spark.sql.legacy.parquet.datetimeRebaseModeInWrite", "CORRECTED") \
            .config("spark.sql.legacy.parquet.datetimeRebaseModeInRead", "CORRECTED") \
            .config("spark.sql.legacy.parquet.int96RebaseModeInWrite", "CORRECTED") \
            .config("spark.sql.legacy.parquet.int96RebaseModeInRead", "CORRECTED") \
            .getOrCreate()

    def _is_valid_table_path(self, path: str) -> bool:
        """Check if the path contains valid table files."""
        # First check if the path itself is a parquet file
        if path.endswith('.parquet'):
            return True   
        # Check for common table format indicators
        if os.path.exists(os.path.join(path, "_delta_log")):
            return True
        if os.path.exists(os.path.join(path, "metadata")):
            return True
        if os.path.exists(os.path.join(path, ".hoodie")):
            return True
            
        # Check for parquet files in the directory
        try:
            # Try to read the path as a parquet file/directory
            self.spark.read.parquet(path).limit(1)
            return True
        except Exception:
            # If reading fails, check for parquet files in the directory
            parquet_files = glob.glob(os.path.join(path, "**/*.parquet"), recursive=True)
            return len(parquet_files) > 0
            
        return False

    def detect_table_format(self, path: str) -> str:
        """Detect the table format based on the path contents."""
        if path.endswith("parquet"):
            return True
        if os.path.exists(os.path.join(path, "_delta_log")):
            return "delta"
        elif os.path.exists(os.path.join(path, "metadata")):
            return "iceberg"
        elif os.path.exists(os.path.join(path, ".hoodie")):
            return "hudi"
        else:
            return "parquet"

    def get_table_metadata(self, path: str) -> Dict[str, Any]:
        """Get metadata for any supported table format."""
        table_format = self.detect_table_format(path)
        
        if table_format == "delta":
            return self._get_delta_metadata(path)
        elif table_format == "iceberg":
            return self._get_iceberg_metadata(path)
        elif table_format == "hudi":
            return self._get_hudi_metadata(path)
        else:
            return self._get_parquet_metadata(path)

    def _get_delta_metadata(self, path: str) -> Dict[str, Any]:
        """Get Delta table metadata."""
        df = self.spark.read.format("delta").load(path)
        delta_log_path = os.path.join(path, "_delta_log")
        
        # Get table properties from the latest checkpoint
        checkpoint_files = glob.glob(os.path.join(delta_log_path, "*.checkpoint"))
        latest_checkpoint = max(checkpoint_files, key=os.path.getctime) if checkpoint_files else None
        
        properties = {}
        if latest_checkpoint:
            with open(latest_checkpoint, 'r') as f:
                checkpoint_data = json.load(f)
                properties = checkpoint_data.get('metaData', {}).get('configuration', {})

        return {
            "format": "delta",
            "schema": self._get_schema_info(df),
            "partitioning": self._get_partition_info(df),
            "properties": properties,
            "version": self._get_delta_version(path),
            "statistics": {
                "row_count": df.count(),
                "file_count": len(glob.glob(os.path.join(path, "*.parquet"))),
                "total_size": sum(os.path.getsize(f) for f in glob.glob(os.path.join(path, "*.parquet")))
            }
        }

    def _get_iceberg_metadata(self, path: str) -> Dict[str, Any]:
        """Get Iceberg table metadata."""
        df = self.spark.read.format("iceberg").load(path)
        metadata_path = os.path.join(path, "metadata")
        
        # Get the latest metadata.json
        metadata_files = glob.glob(os.path.join(metadata_path, "*.metadata.json"))
        latest_metadata = max(metadata_files, key=os.path.getctime) if metadata_files else None
        
        metadata = {}
        if latest_metadata:
            with open(latest_metadata, 'r') as f:
                metadata = json.load(f)

        return {
            "format": "iceberg",
            "schema": self._get_schema_info(df),
            "partitioning": self._get_partition_info(df),
            "snapshots": self._get_iceberg_snapshots(path),
            "properties": metadata.get('properties', {}),
            "statistics": {
                "row_count": df.count(),
                "file_count": len(glob.glob(os.path.join(path, "*.parquet"))),
                "total_size": sum(os.path.getsize(f) for f in glob.glob(os.path.join(path, "*.parquet")))
            }
        }

    def _get_hudi_metadata(self, path: str) -> Dict[str, Any]:
        """Get Hudi table metadata."""
        df = self.spark.read.format("hudi").load(path)
        hoodie_path = os.path.join(path, ".hoodie")
        
        # Read Hudi properties
        properties = {}
        properties_file = os.path.join(hoodie_path, "hoodie.properties")
        if os.path.exists(properties_file):
            with open(properties_file, 'r') as f:
                for line in f:
                    if '=' in line:
                        key, value = line.strip().split('=', 1)
                        properties[key] = value

        return {
            "format": "hudi",
            "schema": self._get_schema_info(df),
            "partitioning": self._get_partition_info(df),
            "timeline": self._get_hudi_timeline(path),
            "properties": properties,
            "statistics": {
                "row_count": df.count(),
                "file_count": len(glob.glob(os.path.join(path, "*.parquet"))),
                "total_size": sum(os.path.getsize(f) for f in glob.glob(os.path.join(path, "*.parquet")))
            }
        }

    def _get_parquet_metadata(self, path: str) -> Dict[str, Any]:
        """Get Parquet table metadata."""
        df = self.spark.read.parquet(path)
        
        # Get file statistics
        parquet_files = glob.glob(os.path.join(path, "**/*.parquet"), recursive=True)
        file_stats = []
        for file in parquet_files:
            file_stats.append({
                "path": file,
                "size": os.path.getsize(file),
                "last_modified": datetime.fromtimestamp(os.path.getmtime(file)).isoformat()
            })

        return {
            "format": "parquet",
            "schema": self._get_schema_info(df),
            "partitioning": self._get_partition_info(df),
            "file_stats": file_stats,
            "statistics": {
                "row_count": df.count(),
                "file_count": len(parquet_files),
                "total_size": sum(os.path.getsize(f) for f in parquet_files)
            }
        }

    def _get_schema_info(self, df) -> Dict[str, Any]:
        """Extract schema information from DataFrame."""
        schema = df.schema
        return {
            "columns": [
                {
                    "name": field.name,
                    "type": str(field.dataType),
                    "nullable": field.nullable,
                    "metadata": field.metadata
                }
                for field in schema
            ],
            "partition_columns": df.rdd.getNumPartitions()
        }

    def _get_partition_info(self, df) -> Dict[str, Any]:
        """Get partitioning information."""
        partition_cols = df.rdd.getNumPartitions()
        return {
            "partition_columns": partition_cols,
            "partition_stats": {
                "total_partitions": df.rdd.getNumPartitions(),
                "partition_size": df.rdd.getNumPartitions()
            }
        }

    def _get_delta_version(self, path: str) -> Dict[str, Any]:
        """Get Delta table version information."""
        delta_log_path = os.path.join(path, "_delta_log")
        version = 0
        last_modified = None
        
        # Get the latest version from checkpoint files
        checkpoint_files = glob.glob(os.path.join(delta_log_path, "*.checkpoint"))
        if checkpoint_files:
            latest_checkpoint = max(checkpoint_files, key=os.path.getctime)
            with open(latest_checkpoint, 'r') as f:
                checkpoint_data = json.load(f)
                version = checkpoint_data.get('version', 0)
                last_modified = datetime.fromtimestamp(os.path.getmtime(latest_checkpoint)).isoformat()
        
        return {
            "version": version,
            "last_modified": last_modified
        }

    def _get_iceberg_snapshots(self, path: str) -> List[Dict[str, Any]]:
        """Get Iceberg table snapshots."""
        metadata_path = os.path.join(path, "metadata")
        snapshots = []
        
        # Get all snapshot files
        snapshot_files = glob.glob(os.path.join(metadata_path, "*.snap"))
        for snapshot_file in snapshot_files:
            with open(snapshot_file, 'r') as f:
                snapshot_data = json.load(f)
                snapshots.append({
                    "snapshot_id": snapshot_data.get('snapshot-id'),
                    "timestamp_ms": snapshot_data.get('timestamp-ms'),
                    "manifest_list": snapshot_data.get('manifest-list'),
                    "summary": snapshot_data.get('summary', {})
                })
        
        return sorted(snapshots, key=lambda x: x['timestamp_ms'], reverse=True)

    def _get_hudi_timeline(self, path: str) -> Dict[str, Any]:
        """Get Hudi table timeline."""
        hoodie_path = os.path.join(path, ".hoodie")
        timeline = {
            "commits": [],
            "clean": [],
            "compaction": []
        }
        
        # Read commit timeline
        commit_timeline = os.path.join(hoodie_path, "archived", "commits")
        if os.path.exists(commit_timeline):
            with open(commit_timeline, 'r') as f:
                timeline["commits"] = [line.strip() for line in f]
        
        # Read clean timeline
        clean_timeline = os.path.join(hoodie_path, "archived", "clean")
        if os.path.exists(clean_timeline):
            with open(clean_timeline, 'r') as f:
                timeline["clean"] = [line.strip() for line in f]
        
        # Read compaction timeline
        compaction_timeline = os.path.join(hoodie_path, "archived", "compaction")
        if os.path.exists(compaction_timeline):
            with open(compaction_timeline, 'r') as f:
                timeline["compaction"] = [line.strip() for line in f]
        
        return timeline
