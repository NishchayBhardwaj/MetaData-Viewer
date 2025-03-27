from pyspark.sql import SparkSession

# Initialize Spark session with Hadoop AWS support
spark = SparkSession.builder \
    .appName("S3 Write Example") \
    .config("spark.hadoop.fs.s3a.impl", "org.apache.hadoop.fs.s3a.S3AFileSystem") \
    .config("spark.hadoop.fs.s3a.access.key", "AKIAXQIQAKZO3FJY773Q") \
    .config("spark.hadoop.fs.s3a.secret.key", "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") \
    .config("spark.hadoop.fs.s3a.endpoint", "s3.amazonaws.com") \
    .config("spark.jars.packages", "org.apache.hadoop:hadoop-aws:3.3.4") \
    .config("spark.hadoop.fs.s3a.aws.credentials.provider", "org.apache.hadoop.fs.s3a.SimpleAWSCredentialsProvider") \
    .getOrCreate()

# Create DataFrame
data = [("Alice", 30), ("Bob", 25), ("Carol", 35)]
df = spark.createDataFrame(data, ["Name", "Age"])

# Write DataFrame to S3 in Parquet format
df.write.parquet("s3a://e6databucket/parquet/sample.parquet")

print("Parquet file written to S3 successfully!")