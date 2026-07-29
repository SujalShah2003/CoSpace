import { MantineProvider } from "@mantine/core";
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes";

export const appMode: "light" | "dark" | "auto" = "light";

const App = () => {
  return (
    <MantineProvider defaultColorScheme={appMode}>
      <RouterProvider router={routes} />
    </MantineProvider>
  );
};

export default App;
