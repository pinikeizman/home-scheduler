import {
  getAvailableDates,
  getAvailableSlots,
  createAppointment,
} from "./visit-api";

export const scheduleMyvisitAPI = async ({
  serviceId,
  serviceName,
  schedules,
  onShcedule,
  onError,
}: {
  serviceId: number;
  serviceName: string;
  schedules: {
    id: string;
    phone: string;
    condition?: (props: {
      date: Date;
      serviceId: number;
      serviceName: string;
    }) => boolean;
  }[];
  onShcedule?: (appointment: any) => void;
  onError?: (e: any) => void;
}) => {
  const slotsMsgs: any = [];
  const now = new Date();
  const startDate = `${now.getFullYear()}-${now.getMonth() + 1}-${
    now.getDate() + 1
  }`;
  const datesRes = await getAvailableDates({
    maxResults: 31,
    serviceId,
    startDate,
  });
  const firstDates = (datesRes.data.Results || []).slice(0, 3);
  for (let { calendarDate, calendarId } of firstDates) {
    const slotsRes = await getAvailableSlots({ calendarId, serviceId });
    if (slotsRes.data.Results?.length) {
      slotsMsgs.push({
        total: slotsRes.data.Results.length,
        [calendarDate]: slotsRes.data.Results.slice(0, 5),
      });
      try {
        for (let { id, phone, condition } of schedules) {
          const maybeTime = slotsRes.data.Results.pop();
          if (!maybeTime) {
            break;
          }
          if (
            condition &&
            !condition({ date: new Date(calendarDate), serviceId, serviceName })
          ) {
            continue;
          }
          const getApp = await createAppointment({
            calendarDate,
            calendarId,
            serviceId,
            id,
            phone,
            time: maybeTime?.Time,
          });
          if (getApp.data.Success) {
            onShcedule && onShcedule({ ...getApp.data, id, phone });
          } else {
            onError && onError({ ...getApp.data, id, phone });
          }
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        console.error("Error assign slot", e);
        onError && onError(e);
      }
    }
  }

  return {
    slotsMsgs,
  };
};
