import { getFullPathFromRoot } from "#cdk/helpers/util.js";
import { IDomainMapOptions } from "#cdk/types/index.js";
import { ApiGatewayV2Client, GetApiMappingsCommand, GetDomainNamesCommand } from "@aws-sdk/client-apigatewayv2";
import fs from "node:fs";
import path from "node:path";

function getCachePath({ region, domainName }: { region: string; domainName: string }) {
  return getFullPathFromRoot(`.cache/${region}-${domainName}.json`);
}

export async function loadCheckDomain({ region, domainName }: { region: string; domainName: string }) {
  const cachePath = getCachePath({ region, domainName });

  console.log({ cachePath });

  try {
    const cachedData = await fs.promises.readFile(cachePath, { encoding: "utf-8" });

    if (cachedData) {
      console.log({ cachedData });
      return JSON.parse(cachedData) as IDomainMapOptions;
    }
  } catch (error) {
    //
  }

  const client = new ApiGatewayV2Client({ region });
  const response = await client.send(new GetDomainNamesCommand({}));

  if (response?.Items?.length) {
    const targetDomain = response.Items.find((f) => f.DomainName === domainName);

    if (targetDomain?.DomainName) {
      const { HostedZoneId, ApiGatewayDomainName } = targetDomain.DomainNameConfigurations?.[0] || {};

      if (HostedZoneId && ApiGatewayDomainName) {
        const data01 = {
          name: targetDomain.DomainName,
          regionalHostedZoneId: HostedZoneId,
          regionalDomainName: ApiGatewayDomainName,
        } as IDomainMapOptions;

        const destDir = path.dirname(cachePath);

        if (!fs.existsSync(destDir)) {
          await fs.promises.mkdir(destDir, { recursive: true });
        }

        await fs.promises.writeFile(cachePath, JSON.stringify(data01), { encoding: "utf-8" });
        return data01;
      }
    }
  }
  return null;
}

export async function loadCheckMappings({ region, domainName }: { region: string; domainName: string }) {
  const client = new ApiGatewayV2Client({ region });
  const response = await client.send(new GetApiMappingsCommand({ DomainName: domainName }));

  return response?.Items || [];
}
