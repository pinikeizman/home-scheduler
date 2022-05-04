import axios, { AxiosResponse } from "axios";
import {
  AnswerRequest,
  AnswerResponse,
  APIResponse,
  AvailableDate,
  PrepareVisitResponse,
  SearchDatesRequest,
  SearchSlotsRequest,
  Slot,
} from "./types";
import { jwt as token } from "../../data";

export const jwt = `JWT ${token}`;

const headers = {
  authorization: jwt,
  "Application-API-Key": "8df143c7-fd10-460e-bcc0-d0c1cf947699",
  "Application-Name": "myVisit.com v4.0",
};

const baseUrl = "https://central.qnomy.com/CentralAPI";

const searchApi = ({
  serviceId,
  startDate,
  maxResults = 31,
}: SearchDatesRequest) =>
  `${baseUrl}/SearchAvailableDates?maxResults=${maxResults}&serviceId=${serviceId}&startDate=${startDate}`;

const slotsApi = ({ calendarId, serviceId }: SearchSlotsRequest) =>
  `${baseUrl}/SearchAvailableSlots?CalendarId=${calendarId}&ServiceId=${serviceId}&dayPart=0`;

const preparedVisitId = (serviceId: number) =>
  `${baseUrl}/Service/${serviceId}/PrepareVisit`;

const answerQuestionUrl = (visitToken: string) =>
  `${baseUrl}/PreparedVisit/${visitToken}/Answer`;

const getAppoitment = (props: {
  date: string;
  time: number;
  serviceId: number;
  visitId: number;
}) =>
  `${baseUrl}/AppointmentSet?ServiceId=${props.serviceId}&appointmentDate=${props.date}&appointmentTime=${props.time}&preparedVisitId=${props.visitId}&position=%7B%22lat%22:%2232.0668%22,%22lng%22:%2234.7649%22,%22accuracy%22:1440%7D`;

export const getAvailableDates = (req: SearchDatesRequest) =>
  axios.get<APIResponse<AvailableDate>>(searchApi(req), {
    headers,
  });

export const getAvailableSlots = (req: SearchSlotsRequest) =>
  axios.get<APIResponse<Slot>>(slotsApi(req), {
    headers,
  });

export const prepareVisit = (serviceId: number) =>
  axios.post<APIResponse<null, PrepareVisitResponse>>(
    preparedVisitId(serviceId),
    null,
    {
      headers,
    }
  );

export const answerIdQuestion = (id: string, preparedVisitToken: string) =>
  axios.post<
    APIResponse<AnswerResponse>,
    AxiosResponse<AnswerResponse>,
    AnswerRequest
  >(
    answerQuestionUrl(preparedVisitToken),
    {
      AnswerIds: null,
      AnswerText: id,
      PreparedVisitToken: preparedVisitToken,
      QuestionId: 113,
      QuestionnaireItemId: 199,
    },
    {
      headers,
    }
  );

export const answerPhoneQuestion = (
  phone: string,
  preparedVisitToken: string
) =>
  axios.post<
    APIResponse<AnswerResponse>,
    AxiosResponse<AnswerResponse>,
    AnswerRequest
  >(
    answerQuestionUrl(preparedVisitToken),
    {
      AnswerIds: null,
      AnswerText: phone,
      PreparedVisitToken: preparedVisitToken,
      QuestionId: 114,
      QuestionnaireItemId: 200,
    },
    {
      headers,
    }
  );

export const answerTypeQuestion = (preparedVisitToken: string) =>
  axios.post<
    APIResponse<AnswerResponse>,
    AxiosResponse<AnswerResponse>,
    AnswerRequest
  >(
    answerQuestionUrl(preparedVisitToken),
    {
      AnswerIds: [76],
      AnswerText: null,
      PreparedVisitToken: preparedVisitToken,
      QuestionId: 116,
      QuestionnaireItemId: 201,
    },
    {
      headers,
    }
  );

export const answerQuestions = async (props: {
  id: string;
  phone: string;
  preparedVisitToken: string;
}) => {
  const idRes = await answerIdQuestion(props.id, props.preparedVisitToken);
  const phoneRes = await answerPhoneQuestion(
    props.phone,
    props.preparedVisitToken
  );
  const typeRes = await answerTypeQuestion(props.preparedVisitToken);
};

export const createAppointment = async (
  props: AvailableDate & {
    serviceId: number;
    id: string;
    phone: string;
    time: number;
  }
) => {
  const prepareVisitRes = await prepareVisit(props.serviceId);
  await answerQuestions({
    id: props.id,
    phone: props.phone,
    preparedVisitToken: prepareVisitRes.data.Data?.PreparedVisitToken || "",
  });
  const appointmentRes = await axios.get<APIResponse<any>>(
    getAppoitment({
      ...props,
      date: props.calendarDate,
      visitId: prepareVisitRes.data.Data?.PreparedVisitId || 0,
    }),
    {
      headers,
    }
  );
  return appointmentRes;
};
