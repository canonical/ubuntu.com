import {
  Currencies,
  DistributorProductTypes,
  Support,
  SLA,
} from "advantage/distributor/utils/utils";
import {
  currencyFormatter,
  generateUniqueId,
  getPreCurrency,
  getPreDuration,
  getPreSelectedItem,
  getProductId,
} from "../utils";

describe("Test generateUniqueId", () => {
  test("should return a string", () => {
    const id = generateUniqueId();
    expect(typeof id).toBe("string");
  });

  test("should generate unique Ids on multiple calls", () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).not.toBe(id2);
  });
});

describe("Test currencyFormatter", () => {
  test("should format USD currency correctly", () => {
    const formatter = currencyFormatter(Currencies.usd);
    expect(formatter.format(1234.56)).toBe("$1,234.56");
  });

  test("should format EUR currency correctly", () => {
    const formatter = currencyFormatter(Currencies.eur);
    expect(formatter.format(1234.56)).toBe("€1,234.56");
  });

  test("should format GBP currency correctly", () => {
    const formatter = currencyFormatter(Currencies.gbp);
    expect(formatter.format(1234.56)).toBe("£1,234.56");
  });
});

describe("Test getProductId", () => {
  test("should return uio-standard-physical for physical-infra-weekday", () => {
    const productId = getProductId(
      DistributorProductTypes.physical,
      Support.infra,
      SLA.weekday,
    );
    expect(productId).toBe("uio-standard-physical");
  });

  test("should return uaia-essential-physical for physical-none-none", () => {
    const productId = getProductId(
      DistributorProductTypes.physical,
      Support.none,
      SLA.none,
    );
    expect(productId).toBe("uaia-essential-physical");
  });

  test("should return uaia-essential-virtual for virtual-none-none", () => {
    const productId = getProductId(
      DistributorProductTypes.virtual,
      Support.none,
      SLA.none,
    );
    expect(productId).toBe("uaia-essential-virtual");
  });

  test("should return no-product", () => {
    const productId = getProductId(
      DistributorProductTypes.desktop,
      Support.infra,
      SLA.weekday,
    );
    expect(productId).toBe("no-product");
  });
});

describe("Test getPreSelectedItem", () => {
  test("should return pre-selected item for uio-standard-physical", () => {
    const items = [
      {
        allowance: 2,
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uai-advanced-desktop-1y-channel-eur-v1",
        price: 60000,
      },
    ];
    const result = getPreSelectedItem(items);
    expect(result).toEqual([
      {
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        type: DistributorProductTypes.desktop,
        support: Support.full,
        sla: SLA.everyday,
        quantity: 2,
      },
    ]);
  });

  test("should return null for unknown item", () => {
    const items = [
      {
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "unknown-item-1y",
        allowance: 2,
        price: 60000,
      },
    ];
    const result = getPreSelectedItem(items);
    expect(result).toEqual([null]);
  });

  test("should handle multiple items", () => {
    const items = [
      {
        allowance: 2,
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uai-advanced-desktop-1y-channel-eur-v1",
        price: 60000,
      },
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-2y-channel-gbp-v1",
        price: 80000,
      },
    ];
    const result = getPreSelectedItem(items);
    expect(result).toEqual([
      {
        id: "lAIeXbXxG9D_nA5v5C5DQeisJ4E2DkLrmxtjXzvCU2nE",
        type: DistributorProductTypes.desktop,
        support: Support.full,
        sla: SLA.everyday,
        quantity: 2,
      },
      {
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        type: DistributorProductTypes.virtual,
        support: Support.infra,
        sla: SLA.everyday,
        quantity: 3,
      },
    ]);
  });
});

describe("Test getPreCurrency", () => {
  test("should return eur when name has eur", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-2y-channel-eur-v1",
        price: 80000,
      },
    ];
    const result = getPreCurrency(items);
    expect(result).toBe("eur");
  });

  test("should return gbp when name has gbp", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-2y-channel-gbp-v1",
        price: 80000,
      },
    ];
    const result = getPreCurrency(items);
    expect(result).toBe("gbp");
  });

  test("should return gbp when name has gbp", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-2y-channel-usd-v1",
        price: 80000,
      },
    ];
    const result = getPreCurrency(items);
    expect(result).toBe("usd");
  });
});

describe("Test getPreDuration", () => {
  test("should return eur when name has eur", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-1y-channel-usd-v1",
        price: 80000,
      },
    ];
    const result = getPreDuration(items);
    expect(result).toBe(1);
  });

  test("should return gbp when name has gbp", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-2y-channel-usd-v1",
        price: 80000,
      },
    ];
    const result = getPreDuration(items);
    expect(result).toBe(2);
  });

  test("should return gbp when name has gbp", () => {
    const items = [
      {
        allowance: 3,
        id: "asdfasdfasdC5DQeisJ4E2DkLrmxtjXzvCU2nE",
        name: "uio-advanced-virtual-3y-channel-usd-v1",
        price: 80000,
      },
    ];
    const result = getPreDuration(items);
    expect(result).toBe(3);
  });
});
