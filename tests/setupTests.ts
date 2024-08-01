import Enzyme from "enzyme";
import Adapter from "@cfaester/enzyme-adapter-react-18";
import '@testing-library/jest-dom';
import { enableFetchMocks } from "jest-fetch-mock";

Enzyme.configure({ adapter: new Adapter() });

enableFetchMocks();
