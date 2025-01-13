import { api } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { ping } from "./ping";
import { site } from "~encore/clients";
import {Site} from "../site/site";
import {CronJob} from "encore.dev/cron";

export const MonitorDB = new SQLDatabase("monitor", {
    migrations: "./migrations",
})

export const check = api(
    {expose: true, method: "POST", path:"/check/:siteID"},
    async (p: {siteID: number}): Promise<{up: boolean}> => {
        const s = await site.get({id: p.siteID});
        return doCheck(s);
    }
)

export const checkAll = api(
    {expose: true, method: "POST", path: "/check-all"},
    async (): Promise<void> => {
        const sites = await site.list();
        await Promise.all(sites.sites.map(doCheck));
    }
)

async function doCheck(site: Site): Promise<{up: boolean}> {
    const {up} = await ping({url: site.url});
    await MonitorDB.exec`
    INSERT INTO checks (site_id, up, checked_at)
    VALUES (${site.id}, ${up}, NOW())`
    return {up};
}

const cronJob = new CronJob("check-all", {
    title: "Check all sites",
    every: "1h",
    endpoint: checkAll,
})