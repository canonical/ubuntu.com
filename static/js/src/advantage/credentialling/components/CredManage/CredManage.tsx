import { CheckboxInput, ContextualMenu, MainTable, Row, Spinner } from "@canonical/react-components";
import { listAllKeys } from "advantage/credentialling/api/keys";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

type ActivationKey = {
    contractItemID: string,
    expirationDate: Date,
    key: string,
    activatedBy?: string,
    productID: string
}
const CredManage = () => {
    const [tab, changeTab] = useState(0);
    const inputRefs = useRef<HTMLButtonElement[] | null[]>([]);
    const [actionLinks, updateActionLinks] = useState<{ children: string, onClick: () => void }[]>([]);
    const { isLoading, data } = useQuery(["ActivationKeys"],
        async () => {
            return listAllKeys("cANU9TzI1bfZ2nnSSSnPdlp30TwdVkLse2vzi1TzKPBc");
        }
    );

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

    const [selectedKeyIds, setSelectedKeyIds] = useState<string[]>([]);
    var selectedKeys = new Map<string, ActivationKey>();
    const handleCheckbox = (keyValue: string, key: ActivationKey) => {
        console.log(keyValue, selectedKeyIds);
        if (selectedKeyIds.includes(keyValue)) {
            setSelectedKeyIds(selectedKeyIds => selectedKeyIds.filter(id => id != keyValue));
            selectedKeys.delete(keyValue);
            console.log(selectedKeys);
            console.log("r", selectedKeyIds);
        }
        else {
            setSelectedKeyIds(selectedKeyIds.concat(keyValue));
            selectedKeys.set(keyValue, key);
            console.log(selectedKeys);
        }
    };
    const copyToClipboard = (value: string) => {
        console.log(value);
        navigator.clipboard.writeText(value);
    };

    const isArchiveable = () => {
        for (var i of selectedKeyIds) {
            console.log("archivable", i, selectedKeys.get(i));
            if ("activatedBy" in selectedKeys.get(i)) {
                return false;
            }
        }
        return true;

    }
    const isUnused = () => {
        return true;
    }
    useEffect(() => {
        let newList = [];
        if (isArchiveable()) {
            newList.push({
                children: "Archive",
                onClick: () => { }
            });
        }
        if (isUnused()) {
            newList.push({
                children: "Copy List",
                onClick: () => { navigator.clipboard.writeText(selectedKeyIds.join(",")) }
            });
            newList.push({
                children: "Refresh Keys",
                onClick: () => { }
            });
        }
        updateActionLinks(newList);

    }, [selectedKeyIds])

    return (<div>
        <Row>
            <h1>Manage exam attempts</h1>
            <p>The table below shows exam attempts you have purchased</p>
            <p>To redeem an attempt, copy the associated key and paste it where the system asks you for the attempt key</p>
        </Row>
        <Row>
            <div className="p-segmented-control col-6">
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
            <div className="col-6">
                {selectedKeyIds.length > 0 ?
                    <ContextualMenu
                        hasToggleIcon
                        links={actionLinks}
                        position="right"
                        toggleLabel="Actions"
                    /> : ""}
            </div>
        </Row>
        <Row>
            {isLoading ? <Spinner /> :
                <MainTable
                    headers={
                        [
                            {
                                content: "",
                                sortKey: "checkbox"
                            },
                            {
                                content: "Exam Key Id",
                                sortKey: "key"
                            },
                            {
                                content: "",
                            },
                            {
                                content: "Assignee",
                                sortKey: "activatedBy"
                            },
                            {
                                content: "Exam",
                                sortKey: "productID",
                            },
                            {
                                content: "ExpirationDate",
                                sortKey: "expirationDate"
                            }
                        ]
                    }
                    rows={
                        data.map((keyitem: ActivationKey) => {
                            return ({
                                columns: [
                                    {
                                        content: <CheckboxInput onChange={() => { handleCheckbox(keyitem["key"], keyitem) }} label="" id={keyitem["key"] + "_checkbox"} />
                                    },
                                    {
                                        content: keyitem["key"]
                                    },
                                    {
                                        content: <a onClick={() => { copyToClipboard(keyitem.key); }}><i className="p-icon--copy"></i></a>
                                    },
                                    {
                                        content: keyitem["activatedBy"] ? keyitem["activatedBy"] : "N/A"
                                    },
                                    {
                                        content: keyitem.productID
                                    },
                                    {
                                        content: keyitem.expirationDate.toString()
                                    },
                                ],
                                sortData: {
                                    ...keyitem,
                                    checkbox: keyitem["key"]
                                }
                            }
                            );
                        })
                    }
                    sortable
                />
            }
        </Row>
    </div>);
};
export default CredManage;
