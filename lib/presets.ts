export type Preset = {
  label: string;
  trace: string;
};

export const PRESET_TRACES: Preset[] = [
  {
    label: "CORS",
    trace: "Access to fetch at 'https://api.example.com/data' from origin 'https://app.example.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
  },
  {
    label: "undefined",
    trace: "TypeError: Cannot read properties of undefined (reading 'map')\n    at UserList (UserList.tsx:24:18)",
  },
  {
    label: "merge conflict",
    trace: "<<<<<<< HEAD\nconst PORT = 3000;\n=======\nconst PORT = process.env.PORT ?? 8080;\n>>>>>>> feature/config",
  },
  {
    label: "timeout",
    trace: "Error: connect ETIMEDOUT 10.0.0.4:5432\n    at Connection.connect (db.ts:41:11)",
  },
];
