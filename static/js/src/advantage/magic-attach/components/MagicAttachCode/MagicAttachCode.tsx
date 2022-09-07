import {
  Button,
  Col,
  Row,
  Input,
  Accordion,
} from "@canonical/react-components";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useState,
  useRef,
} from "react";

type Props = {
  setCodeStatus: Dispatch<SetStateAction<boolean>>;
  setMagicAttachCode: Dispatch<SetStateAction<string>>;
};
const MagicAttachCode = ({ setCodeStatus, setMagicAttachCode }: Props) => {
  const [tab, changeTab] = useState(0);
  const inputRefs = useRef<HTMLButtonElement[]|null[]>([]);
  const switchTab = (event: React.KeyboardEvent<HTMLButtonElement>,index:number) => {
    event.preventDefault();
    changeTab(index);
    console.log(inputRefs.current[index]);
    console.log(inputRefs.current);
    inputRefs.current[index].focus();
  };
  return (
    <>
      <Row>
        <Col
          size={6}
          className="inside col-12 col-start-large-4 u-align--center"
        >
          <Input
            type="text"
            id="exampleTextInput3"
            label="Enter the code displayed in your installation"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setMagicAttachCode(event.target.value);
            }}
          />
          <Button
            appearance="positive"
            onClick={() => {
              setCodeStatus(true);
            }}
          >
            Submit
          </Button>
        </Col>
      </Row>
      <Accordion
        sections={[
          {
            content: (
              <>
                <div className="p-segmented-control">
                  <div
                    className="p-segmented-control__list"
                    role="tablist"
                    aria-label="Magic Attach Workings"
                  >
                    <button
                      className="p-segmented-control__button"
                      role="tab"
                      aria-selected={tab == 0}
                      aria-controls="desktop-tab"
                      id="desktop"
                      onClick={() => {
                        changeTab(0);
                      }}
                      onKeyUp={(e)=>{switchTab(e,1)}}
                      ref={(ref) => (inputRefs.current[0] = ref)}
                    >
                      Desktop
                    </button>
                    <button
                      className="p-segmented-control__button"
                      role="tab"
                      aria-selected={tab == 1}
                      aria-controls="server-tab"
                      id="server"
                      tabIndex={-1}
                      onClick={() => {
                        changeTab(1);
                      }}
                      onKeyUp={(e)=>{switchTab(e,0)}}
                      ref={(ref) => (inputRefs.current[1] = ref)}
                    >
                      Server
                    </button>
                  </div>
                </div>
                <div
                  tabIndex={0}
                  role="tabpanel"
                  id="desktop-tab"
                  aria-labelledby="desktop"
                  hidden={tab == 0}
                >
                  <p>
                    A system to help you move from configuration management to
                    application management across your hybrid cloud estate -
                    through sharable, reusable, tiny applications called Charmed
                    Operators.
                  </p>
                </div>

                <div
                  tabIndex={0}
                  role="tabpanel"
                  id="server-tab"
                  aria-labelledby="server"
                  hidden={tab == 1}
                >
                  <p>
                    A set of tools to help you write Charmed Operators and to
                    package them as Charms.
                  </p>
                </div>
              </>
            ),
            title: "Where can I find the Ubuntu Pro installer code?",
          },
        ]}
        titleElement="h3"
      />
    </>
  );
};

export default MagicAttachCode;
