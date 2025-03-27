from flask import Flask, request, jsonify
from flask_cors import CORS
from spark_utils.metadata_reader import MetadataReader
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize the metadata reader
metadata_reader = MetadataReader()

@app.route('/api/metadata', methods=['POST'])
def get_metadata():
    try:
        data = request.get_json()
        if not data or 'path' not in data:
            return jsonify({"error": "Path is required"}), 400

        path = data['path']
        # Replace s3:// with s3a:// for Spark
        path = path.replace('s3://', 's3a://')
        
        metadata = metadata_reader.get_table_metadata(path)
        return jsonify(metadata)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sample', methods=['POST'])
def get_sample_data():
    try:
        data = request.get_json()
        if not data or 'path' not in data or 'limit' not in data:
            return jsonify({"error": "Path and limit are required"}), 400

        path = data['path']
        limit = data['limit']
        
        # Replace s3:// with s3a:// for Spark
        path = path.replace('s3://', 's3a://')
        
        # Get the table format
        table_format = metadata_reader.detect_table_format(path)
        
        # Read sample data based on format
        if table_format == "delta":
            df = metadata_reader.spark.read.format("delta").load(path)
        elif table_format == "iceberg":
            df = metadata_reader.spark.read.format("iceberg").load(path)
        elif table_format == "hudi":
            df = metadata_reader.spark.read.format("hudi").load(path)
        else:
            df = metadata_reader.spark.read.parquet(path)

        # Convert to list of dictionaries
        sample_data = df.limit(limit).toPandas().to_dict('records')
        return jsonify({"data": sample_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
