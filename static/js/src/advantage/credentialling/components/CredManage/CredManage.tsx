import { Row, Spinner } from "@canonical/react-components";
import { listAllKeys } from "advantage/credentialling/api/keys";
import React, { useRef, useState } from "react";
import { useQuery } from "react-query";
import KeyTable from "./KeyTable";

type ActivationKey = {
    contractItemID: string,
    expirationDate: Date,
    key: string,
    productID: string
}
const CredManage = () => {
    const [tab, changeTab] = useState(0);
    const [sortAttributes, setsortAttributes] = useState<[string, boolean]>(["expirationDate", true]);
    const inputRefs = useRef<HTMLButtonElement[] | null[]>([]);
    const { isLoading, data } = useQuery(["ActivationKeys"],
        async () => {
            return listAllKeys("cANU9TzI1bfZ2nnSSSnPdlp30TwdVkLse2vzi1TzKPBc");
        }
    );

    const sortTable = (attr: string) => {
        if (attr == "key") {
            data.sort((x: ActivationKey, y: ActivationKey) => { return x[attr].localeCompare(y[attr]) });
        }
        else if (attr == "expirationDate") {
            data.sort((x: ActivationKey, y: ActivationKey) => { return x[attr] - y[attr] });
        }
        if (attr == sortAttributes[0]) {
            if (sortAttributes[1] == true) {
                data.reverse();
            }
            setsortAttributes([attr, !sortAttributes[1]]);
        }
        else {
            setsortAttributes([attr, true]);
        }
        console.log(data);
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

    return (<div>
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
            <table aria-label="Manage activation keys">
                <thead>
                    <tr>
                        <th></th>
                        <th aria-sort="none" onClick={() => { sortTable("key") }}>Exam Key Id</th>
                        <th></th>
                        <th>Asignee</th>
                        <th>Exam</th>
                        <th aria-sort="none" onClick={() => { sortTable("expirationDate") }}>Expiration Date</th>
                    </tr>
                </thead>
                {isLoading ? <Spinner /> : <KeyTable keyList={data} reload={sortAttributes} />}
            </table>
        </Row>
    </div>);
};
export default CredManage;
