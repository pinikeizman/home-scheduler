import { App } from "@slack/bolt";
import { AddJob } from "../scheduler";
import { scheduleMyvisitAPI } from "./myvisit.api";

const services = [
  {
  serviceId:  "2167",
  serviceName: "ראש העין"
},{
  serviceId:  "2113",
  serviceName: "פתח תקווה"
},
{
  serviceId:  "2153",
  serviceName: "חולון"
}
,{
  serviceId:  "2099",
  serviceName: "לשכת תל אביב מרכז (קריית הממשלה)"
},{
  serviceId:  "2163",
  serviceName: "בני ברק"
},{
  serviceId:  "2095",
  serviceName: "לשכת רמת גן-גבעתיים"
},
]

export const getAvailableSlots =  (app: App, channel: string)=>services.forEach(async i => {
  try{
    await scheduleMyvisitAPI(app, channel, i.serviceId, i.serviceName)
    await new Promise(r => setTimeout(r, 1000));
  }catch(e){
    console.error("Error while getting passport schedules", i, e)
  }
})

export const createJob = (app: App, channel: string): AddJob => ({
  name: "Passport Appointment",
  description: "Set a passport event",
  expression: "0 */1 * * *",
  cb: () => getAvailableSlots(app,channel)
});

export default {
  createJob,
};
