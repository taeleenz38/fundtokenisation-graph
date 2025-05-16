import { BigInt } from "@graphprotocol/graph-ts";

export const formatDate = (timestamp: BigInt): string => {
    const timestampNumber = timestamp.toI64();
    const date = new Date(timestampNumber * 1000);

    const melbourneOffsetStandard = 10;
    const melbourneOffsetDST = 11;

    const year = date.getUTCFullYear();
    const startDST = getFirstSundayOfMonth(year, 10);
    const endDST = getFirstSundayOfMonth(year, 4);

    let melbourneOffsetHours = melbourneOffsetStandard;
    if (date.getTime() >= startDST.getTime() || date.getTime() < endDST.getTime()) {
        melbourneOffsetHours = melbourneOffsetDST;
    }
    date.setUTCHours(date.getUTCHours() + melbourneOffsetHours);
    const formattedDate = date.toISOString().split("T")[0];
    const formattedTime = date.toISOString().split("T")[1].split(".")[0];

    return `${formattedDate} ${formattedTime}`;
};

function getFirstSundayOfMonth(year: i32, month: i32): Date {

    const firstDay = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); 
    const dayOfWeek = firstDay.getUTCDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;

    return new Date(Date.UTC(year, month - 1, 1 + daysUntilSunday, 0, 0, 0, 0));
}