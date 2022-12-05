import {
    Col,
    Row,
    Accordion,
} from "@canonical/react-components";
import React, {
    useState,
    useRef,
} from "react";
const AttachInstructions = () => {
    const [tab, changeTab] = useState(0);
    const inputRefs = useRef<HTMLButtonElement[] | null[]>([]);
    const switchTab = (
        event: React.KeyboardEvent<HTMLButtonElement>,
        index: number
    ) => {
        event.preventDefault();
        changeTab(index);
        console.log(inputRefs.current[index]);
        console.log(inputRefs.current);
        inputRefs.current[index].focus();
    };
    return (
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
                                        onKeyUp={(e) => {
                                            switchTab(e, 1);
                                        }}
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
                                        onKeyUp={(e) => {
                                            switchTab(e, 0);
                                        }}
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
                                hidden={tab == 1}
                            >
                                <Row>
                                    <Col size={6}></Col>
                                    <Col size={6}>
                                        <p>
                                            During installation, you'll be asked whether you want to
                                            Upgrade to Ubuntu Pro.
                                            <ol className="p-stepped-list">
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        Choose "Enable Ubuntu Pro"
                                                    </p>
                                                </li>
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        On the next screen you will be presented with a
                                                        six-character code as part of the first option.
                                                    </p>
                                                </li>
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        Enter the code into the field above on this page.
                                                    </p>
                                                </li>
                                            </ol>
                                        </p>
                                    </Col>
                                </Row>
                            </div>

                            <div
                                tabIndex={0}
                                role="tabpanel"
                                id="server-tab"
                                aria-labelledby="server"
                                hidden={tab == 0}
                            >
                                <Row>
                                    <Col size={6}></Col>
                                    <Col size={6}>
                                        <p>
                                            During installation, you'll be asked whether you want to
                                            Upgrade to Ubuntu Pro.
                                            <ol className="p-stepped-list">
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        Choose "Enable Ubuntu Pro"
                                                    </p>
                                                </li>
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        On the next screen you will be presented with a
                                                        six-character code as part of the first option.
                                                    </p>
                                                </li>
                                                <li className="p-stepped-list__item">
                                                    <p className="p-stepped-list__title">
                                                        Enter the code into the field above on this page.
                                                    </p>
                                                </li>
                                            </ol>
                                        </p>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    ),
                    title: "Where can I find the Ubuntu Pro installer code?",
                },
            ]}
            titleElement="h3"
        />
    )
}
export default AttachInstructions;