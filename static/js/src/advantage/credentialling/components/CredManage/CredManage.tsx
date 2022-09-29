import { ModularTable, Row } from "@canonical/react-components";
import React, { useMemo, useRef, useState } from "react";
const CredManage = () => {
    const [tab, changeTab] = useState(0);
    const inputRefs = useRef<HTMLButtonElement[] | null[]>([]);
    const filterTable = () => {
        if (tab == 0) {

        }
    }
    const switchTab = (
        event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number
    ) => {
        event.preventDefault();
        if (event.key == "ArrowLeft") {
            changeTab((currentIndex - 1) % 4);
            inputRefs.current[(currentIndex - 1) % 4].focus();
        }
        if (event.key == "ArrowRight") {
            changeTab((currentIndex + 1) % 4);
            inputRefs.current[(currentIndex + 1) % 4].focus();
        }
    };
    return <div>
        <Row>
            <h1>Manage exam attempts</h1>
            <p>The table below shows exam attempts you have purchased</p>
            <p>To redeem an attempt, copy the associated key and paste it where the system asks you for the attempt key</p>
        </Row>
        <Row>
            <div className="p-segmented-control">
                <div
                    className="p-segmented-control__list"
                    role="tablist"
                    aria-label="Activatation Keys Table Filter"
                >
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 0}
                        aria-controls="all-keys-tab"
                        id="all-keys"
                        onClick={() => {
                            changeTab(0);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 4);
                        }}
                        ref={(ref) => (inputRefs.current[0] = ref)}
                    >
                        All Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 1}
                        aria-controls="unused-keys-tab"
                        id="unused-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(1);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 1);
                        }}
                        ref={(ref) => (inputRefs.current[1] = ref)}
                    >
                        Unused Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 2}
                        aria-controls="active-keys-tab"
                        id="active-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(2);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 2);
                        }}
                        ref={(ref) => (inputRefs.current[2] = ref)}
                    >
                        Active Keys
                    </button>
                    <button
                        className="p-segmented-control__button"
                        role="tab"
                        aria-selected={tab == 3}
                        aria-controls="archived-keys-tab"
                        id="archived-keys"
                        tabIndex={-1}
                        onClick={() => {
                            changeTab(3);
                        }}
                        onKeyUp={(e) => {
                            switchTab(e, 3);
                        }}
                        ref={(ref) => (inputRefs.current[3] = ref)}
                    >
                        Archived Keys
                    </button>
                </div>
            </div>
        </Row>
        <Row>
            <ModularTable
                columns={useMemo(() => [
                    {
                        Header: "EXAM KEY ID",
                        accessor: "key"
                    },
                    {
                        Header: "ASSIGNEE",
                        accessor: "activatedBy"
                    },
                    {
                        Header: "EXAM",
                        accessor: "productID"
                    },
                    {
                        Header: "EXPIRATION DATE",
                        accessor: "expirationDate"
                    }
                ], []
                )}
                data={useMemo(() => [{}], [])}
            />
        </Row>
    </div>
}
export default CredManage;