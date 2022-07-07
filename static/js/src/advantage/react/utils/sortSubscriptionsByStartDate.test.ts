import { userSubscriptionFactory } from "advantage/tests/factories/api";
import { sortSubscriptionsByStartDate } from "./sortSubscriptionsByStartDate";

describe("sortSubscriptionsByStartDate", () => {
  it("sorts the subscriptions", () => {
    const subscriptions = [
      userSubscriptionFactory.build({
        start_date: new Date("2020-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        start_date: new Date("2021-08-11T02:56:54Z"),
      }),
      userSubscriptionFactory.build({
        start_date: new Date("1999-08-11T02:56:54Z"),
      }),
    ];
    expect(sortSubscriptionsByStartDate(subscriptions)).toStrictEqual([
      subscriptions[1],
      subscriptions[0],
      subscriptions[2],
    ]);
  });
});
