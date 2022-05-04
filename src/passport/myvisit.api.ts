import { App } from "@slack/bolt";
import axios from "axios";
import { createMDSection } from "../slack";

type Slot = { Time: number };
type AvailableDate = { calendarDate: string; calendarId: number };
type APIResponse<T> = {
  Success: boolean;
  Results: T[];
  Page: number;
  ResultsPerPage: number;
  TotalResults: number;
  ErrorMessage: string | null;
  ErrorNumber: number;
  Messages: string[] | null;
};
const jwt =
  "JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InljeDFyWFRmalRjQjZIQWV1aGxWQklZZmZUbyJ9.eyJpc3MiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJhdWQiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJuYmYiOjE2NTE2NDE3MDMsImV4cCI6MTY4Mjc0NTcwMywidW5pcXVlX25hbWUiOiI0N2U4Njk5Zi03Yjg3LTRjZmEtOGFhZC1hYzQ4OGMxNjUzZTkifQ.qhgxwQKDMQcHvSEzb_JI-fBUUtL1tkV2RKTbLVBcdRI291JvLL6XebvJFaYsPtyScNAP3070WUCYTy7v2eNz9C4VsrtkD2zIEslZ4NCaFNTLVBrI1bTgyjKB_uDpukxESVhMUi7FScbJKCy0PKktw68eKyLKnDW3ck20XISU2Z1bFwRgL0tk-BFFVSfPmIIF3bJx0OeqV1emzbi1hfpfuN1uR5ObRKkUSI6FWaBoZuehZ7esTPbtlDN2sE_-_96hq4i4FkzIwWwsfExC1APL6OBeghDSucSBdmBWosRdxcrdDnEPC6rV2GagkyxU6mKmjyy5Z2btQlW8oyb5Tt7wvQ";
const baseUrl = "https://central.qnomy.com/CentralAPI";
const searchApi = (
  serviceId: string,
  startDate: string,
  maxResults: number = 31
) =>
  `SearchAvailableDates?maxResults=${maxResults}&serviceId=${serviceId}&startDate=${startDate}`;
const slotsApi = (serviceId: string, calendarId: string) =>
  `SearchAvailableSlots?CalendarId=${calendarId}&ServiceId=${serviceId}&dayPart=0`;
const headers = {
  authorization: jwt,
  "Application-API-Key": "8df143c7-fd10-460e-bcc0-d0c1cf947699",
  "Application-Name": "myVisit.com v4.0",
  PreparedVisitToken: "22e08777-addb-4a9c-8154-ae6ca0334402",
};
export const scheduleMyvisitAPI = async (
  app: App,
  responedToChannel: string,
  serviceId: string,
  serviceName:string
) => {
  const url = [baseUrl, searchApi(serviceId, "2022-05-04")].join("/");
  const datesRes = await axios.get<APIResponse<AvailableDate>>(url, {
    headers,
  });
  let res: any = []
  for (let slot of (datesRes.data.Results?.slice(0,5) || [])){
    const surl = [baseUrl, slotsApi(serviceId, slot.calendarId.toString())].join(
      "/"
      );
      const slotsRes = await axios.get<APIResponse<Slot>>(surl, { headers });
      if(slotsRes.data.Results?.length)
        res.push({ [slot.calendarDate]: slotsRes.data.Results.slice(0,5), total:slotsRes.data.Results.length  });
  }

  app.client.chat.postMessage({
    channel: responedToChannel,
    text: "Passport available slots report",
    blocks: [
      createMDSection(serviceName),
      createMDSection(res),
    ],
  })
};
