export const jwt: string = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IjRyQTdaXzJOWTRRaDFHenVkc2ZsZ0hlUFczdyJ9.eyJpc3MiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJhdWQiOiJodHRwOi8vY2VudHJhbC5xbm9teS5jb20iLCJuYmYiOjE2NTIyODM3MTYsImV4cCI6MTY1MjI4NTUxNiwidW5pcXVlX25hbWUiOiI0N2U4Njk5Zi03Yjg3LTRjZmEtOGFhZC1hYzQ4OGMxNjUzZTkifQ.s4h3bnZRk9kA4y84JjtRLZc3f7ROr7EJ_K_6bi4lELJ7EBy1V4188kN7Gm4kWcMQMIS8vccAHxjMgQiZGO43FbNGeC25eY0aEonu15yA2chgmnWisMjHpW66XMOXHTsZ5sm5tfZpnMSdgxA5f8ug-2jMSSeqEP9AH7RAT-7e6x_o9Tmsdh22ErU9fMwv8KWrSeb2eeVLq6fWU-0dC97nONL4s2j8ljLLCF29jWRNdC_hq4Er9wme5ew7q5hEVx_0LPBcVLYZyCDVRdortYjTCnPcBbP9o8DCK31EuJkNzs_BQhNIcy4i3TeSSi9n69zeHddr6pVrCUtGqcDA-0tGtQ";

export const schedules = [
  {
    id: "235735032",
    phone: "0527073260",
    condition: ({ date, serviceId }: { date: Date, serviceId: number }) => date < new Date("2022-07-20") && !![2110, 2144, 2146].find(a => a === serviceId),
  },
];
