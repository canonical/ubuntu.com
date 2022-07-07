import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { enableFetchMocks } from "jest-fetch-mock";
import "@testing-library/jest-dom";

Enzyme.configure({ adapter: new Adapter() });

enableFetchMocks();
