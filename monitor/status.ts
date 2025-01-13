import {api} from "encore.dev/api";
import {MonitorDB} from "./check";

interface SiteStatus {
    id: number;
    up: boolean;
    checkedAt: string;
}

interface StatusResponse {
    sites: SiteStatus[];
}

export const status = api(
    {expose: true, path: "/status", method: "GET"},
    async (): Promise<StatusResponse> => {
        const rows = await MonitorDB.query`
            SELECT DISTINCT ON (site_id) site_id, up, checked_at
            FROM checks
            ORDER BY site_id, checked_at DESC
        `;
        const results: SiteStatus[] = [];
        for await (const row of rows) {
            results.push({
                id: row.site_id,
                up: row.up,
                checkedAt: row.checked_at,
            });
        }
        return {sites: results};
    }
)