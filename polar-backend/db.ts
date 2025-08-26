import { InfluxDB, Point } from "@influxdata/influxdb-client";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.INFLUXDB_URL || "http://localhost:8086";
const token = process.env.INFLUXDB_TOKEN || "";
const org = process.env.INFLUXDB_ORG || "myorg";
const bucket = process.env.INFLUXDB_BUCKET || "trades";

const influxDB = new InfluxDB({ url, token });
const writeApi = influxDB.getWriteApi(org, bucket, "ns"); // ns = nanoseconds precision
const queryApi = influxDB.getQueryApi(org);
export { writeApi, Point, queryApi, influxDB, bucket };
