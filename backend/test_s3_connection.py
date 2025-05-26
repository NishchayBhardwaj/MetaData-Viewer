from pyspark.sql import SparkSession
import os

os.makedirs("iceberg/employees.iceberg", exist_ok=True)

spark = SparkSession.builder \
    .appName("IcebergSample") \
    .config("spark.jars.packages", "org.apache.iceberg:iceberg-spark-runtime-3.4_2.12:1.4.3") \
    .config("spark.sql.catalog.local", "org.apache.iceberg.spark.SparkCatalog") \
    .config("spark.sql.catalog.local.type", "hadoop") \
    .config("spark.sql.catalog.local.warehouse", os.path.abspath("./iceberg")) \
    .getOrCreate()

data = [("Alice", 30), ("Bob", 25), ("Carol", 35)]
df = spark.createDataFrame(data, ["name", "age"])

df.writeTo("local.employees").using("iceberg").tableProperty("format-version", "2").createOrReplace()

print("Iceberg data written to ./iceberg/employees/")
spark.stop()
