import { queryApi, bucket } from "./db";

export async function getRecentTrades(limit = 10) {
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => r._measurement == "trades")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> keep(columns: ["_time", "symbol", "price", "quantity", "isMaker","marketMaker"])
      |> limit(n: ${limit})
  `;

  return new Promise((resolve, reject) => {
    const results: any[] = [];
    +6;
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(err) {
        reject(err);
      },
      complete() {
        resolve(results);
      },
    });
  });
}
