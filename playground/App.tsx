import {MantineProvider} from "@mantine/core";
import {Playground} from "./Playground";

export function App() {
  return (
    <MantineProvider>
      <Playground />
    </MantineProvider>
  );
}
