import { TableClient, odata } from "@azure/data-tables";
import type { ReportRecord, Sector, RefusalContext } from "./types";

const TABLE_NAME = process.env.REPORTS_TABLE_NAME || "Reports";
const CONNECTION_STRING = process.env.AzureWebJobsStorage || "UseDevelopmentStorage=true";

let clientPromise: Promise<TableClient> | null = null;

async function getClient(): Promise<TableClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = TableClient.fromConnectionString(CONNECTION_STRING, TABLE_NAME, {
        allowInsecureConnection: true,
      });
      await client.createTable();
      return client;
    })();
  }
  return clientPromise;
}

interface ReportEntity {
  partitionKey: string; // companyCountry
  rowKey: string; // report id
  companyName: string;
  companyCountry: string;
  sector: Sector;
  ibanCountry: string;
  context: RefusalContext;
  incidentDate: string;
  description?: string;
  createdAt: string;
  source: "live" | "seed";
}

export async function insertReport(report: ReportRecord): Promise<void> {
  const client = await getClient();
  const entity: ReportEntity = {
    partitionKey: report.companyCountry,
    rowKey: report.id,
    companyName: report.companyName,
    companyCountry: report.companyCountry,
    sector: report.sector,
    ibanCountry: report.ibanCountry,
    context: report.context,
    incidentDate: report.incidentDate,
    description: report.description,
    createdAt: report.createdAt,
    source: report.source,
  };
  await client.createEntity(entity);
}

export async function listReports(): Promise<ReportRecord[]> {
  const client = await getClient();
  const results: ReportRecord[] = [];
  for await (const entity of client.listEntities<ReportEntity>()) {
    results.push({
      id: entity.rowKey!,
      companyName: entity.companyName,
      companyCountry: entity.companyCountry,
      sector: entity.sector,
      ibanCountry: entity.ibanCountry,
      context: entity.context,
      incidentDate: entity.incidentDate,
      description: entity.description,
      createdAt: entity.createdAt,
      source: entity.source,
    });
  }
  return results;
}

export async function clearSeedReports(): Promise<void> {
  const client = await getClient();
  const toDelete: { partitionKey: string; rowKey: string }[] = [];
  for await (const entity of client.listEntities<ReportEntity>({
    queryOptions: { filter: odata`source eq 'seed'` },
  })) {
    toDelete.push({ partitionKey: entity.partitionKey!, rowKey: entity.rowKey! });
  }
  await Promise.all(toDelete.map((e) => client.deleteEntity(e.partitionKey, e.rowKey)));
}
