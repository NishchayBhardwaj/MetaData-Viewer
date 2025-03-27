# Metastore Viewer

A web-based tool for exploring metadata of Parquet, Iceberg, Delta, and Hudi tables stored in S3 or other object stores.

## Features

- Support for multiple table formats:
  - Apache Parquet
  - Apache Iceberg
  - Delta Lake
  - Apache Hudi
- Schema visualization
- Table properties inspection
- Sample data preview
- Interactive UI with Material-UI components

## Prerequisites

- Python 3.8+
- Node.js 16+
- Java 11+ (for Apache Spark)
- AWS credentials configured (for S3 access)

## Setup

### Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
```

4. Run the Flask API:
```bash
python -m api.app
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter the S3 path to your table (e.g., `s3://your-bucket/path/to/table`)
3. The viewer will automatically detect the table format and display:
   - Schema information
   - Table properties
   - Sample data

## API Endpoints

- `POST /api/metadata`: Get table metadata
  ```json
  {
    "path": "s3://bucket/path/to/table"
  }
  ```

- `POST /api/sample`: Get sample data
  ```json
  {
    "path": "s3://bucket/path/to/table",
    "limit": 10
  }
  ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 