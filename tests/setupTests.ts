import Enzyme from "enzyme";
import Adapter from "@cfaester/enzyme-adapter-react-18";
import { enableFetchMocks } from "jest-fetch-mock";
import "@testing-library/jest-dom";

Enzyme.configure({ adapter: new Adapter() });

enableFetchMocks();
