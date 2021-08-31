import Enzyme from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { enableFetchMocks } from "jest-fetch-mock";

Enzyme.configure({ adapter: new Adapter() });

enableFetchMocks();
