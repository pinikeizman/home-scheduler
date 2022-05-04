import { App } from "@slack/bolt";
import { createMDSection, createPlainTextSection } from "../slack";
import { AddJob } from "../scheduler";
import { scheduleMyvisitAPI } from "./myvisit.logic";
import {schedules} from '../../data'

const services = [
  {
    serviceId: 2349,
    serviceName: "מודיעין",
  },    
  {
    serviceId: 2159,
    serviceName: "מבשרת ציון",
  },     
  {
    serviceId: 2155,
    serviceName: "ירושלים",
  },  
  {
    serviceId: 2144,
    serviceName: "חדרה",
  }, 
  {
    serviceId: 2146,
    serviceName: "נתניה",
  },    
  {
    serviceId: 2110,
    serviceName: "כפר סבא",
  },  
  {
    serviceId: 2167,
    serviceName: "ראש העין",
  },
  {
    serviceId: 2245,
    serviceName: "הרצליה",
  },
  {
    serviceId: 2113,
    serviceName: "פתח תקווה",
  },
  {
    serviceId: 2153,
    serviceName: "חולון",
  },
  {
    serviceId: 2165,
    serviceName: "לשכת תל אביב דרום",
  },
  {
    serviceId: 2099,
    serviceName: "לשכת תל אביב מרכז (קריית הממשלה)",
  },
  {
    serviceId: 2163,
    serviceName: "בני ברק",
  },
  {
    serviceId: 2095,
    serviceName: "לשכת רמת גן-גבעתיים",
  },
];

export const getAvailableSlots = (app: App, channel: string) =>
  services.forEach(async ({ serviceId, serviceName }) => {
    try {
      const { slotsMsgs } = await scheduleMyvisitAPI({
        schedules,
        serviceId,
        serviceName,
        onShcedule: (data) => {
          ["U03ET0UK6AC", "U02S3G28H9Q"].map((channel) =>
            app.client.chat.postMessage({
              channel,
              text: "✅ Passport Scheduled!! 🎉🎉🎉",
              blocks: [
                createPlainTextSection(
                  `✅ Passport Scheduled for id: ${data.id}, phone: ${data.phone} 🎉🎉🎉`
                ),
                createMDSection(data),
              ],
            })
          );
        },
        onError: (data) => {
          ["U03ET0UK6AC", "U02S3G28H9Q"].map((channel) =>
            app.client.chat.postMessage({
              channel,
              text: `❌ Passport Schduled Error  id: ${data.id}, phone: ${data.phone}`,
              blocks: [
                createPlainTextSection("❌ Passport Schduled Error"),
                createMDSection(data),
              ],
            })
          );
        },
      });

      app.client.chat.postMessage({
        channel,
        text: "Passport available slots report",
        blocks: [
          createMDSection(
            serviceName + " - Report Date" + new Date().toDateString()
          ),
          createMDSection(slotsMsgs.length ? slotsMsgs : "No Available Slots"),
        ],
      });
      await new Promise((r) => setTimeout(r, 1000));
    } catch (e) {
      console.error("Error while getting passport schedules", e);
    }
  });

export const createJob = (app: App, channel: string): AddJob => ({
  name: "Passport Appointment",
  description: "Set a passport event",
  expression: "*/10 * * * *",
  cb: () => getAvailableSlots(app, channel),
});

export default {
  createJob,
};
