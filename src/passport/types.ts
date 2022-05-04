export type Slot = { Time: number };
export type AvailableDate = { calendarDate: string; calendarId: number };
export type APIResponse<T, R = any> = {
  Success: boolean;
  Results: T[];
  Data: R | null;
  Page: number;
  ResultsPerPage: number;
  TotalResults: number;
  ErrorMessage: string | null;
  ErrorNumber: number;
  Messages: string[] | null;
};

export type SearchDatesRequest = {
    serviceId: number;
    startDate: string;
    maxResults: number;
  };
  export type SearchSlotsRequest = {
    serviceId: number;
    calendarId: number;
  };
  export type PrepareVisitResponse = {
    PreparedVisitId: number;
    UserId: number;
    ServiceId: number;
    ServiceTypeId: number;
    OrganizationId: any;
    DateCreated: string;
    PreparedVisitToken: string;
  };
  
  export type AnswerRequest = {
    PreparedVisitToken: string;
    QuestionnaireItemId: number;
    QuestionId: number;
    AnswerIds: any[] | null;
    AnswerText: string | null;
  };
  export type AnswerResponse = Partial<{
    Success: boolean;
    Page: number;
    ResultsPerPage: number;
    TotalResults: number;
    ErrorMessage: string;
    ErrorNumber: number;
    Messages: any[];
    Data: any;
  }>;
  