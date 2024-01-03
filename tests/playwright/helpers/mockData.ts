// post /pro/purchase/preview${window.location.search}
export const previewResponse = {
  "currency": "usd",
  "end_of_cycle": "",
  "id": "",
  "items": null,
  "payment_status": null,
  "reason": "subscription_create",
  "start_of_cycle": "",
  "status": "draft",
  "tax_amount": null,
  "total": 45000,
  "url": null
}

// post /account/customer-info/${accountId}${queryString}
export const customerInfoResponse = {
    "accountInfo": {
        "createdAt": "2023-06-21T10:19:18Z",
        "externalAccountIDs": [
            {
                "IDs": [
                    "cus_OAc0ko9kKLLpn2"
                ],
                "origin": "Stripe"
            },
            {
                "IDs": [
                    "0013M00001QN0K4QAL"
                ],
                "origin": "Salesforce"
            }
        ],
        "id": "aACd-Dgydz9UmVpft445tErM1NIVHbVhX-G7bbxzAWgQ",
        "lastModifiedAt": "2023-08-08T11:04:08Z",
        "name": "Canonical",
        "type": "paid"
    },
    "customerInfo": {
        "address": {
            "city": "test",
            "country": "JP",
            "line1": "test 2",
            "line2": "",
            "postal_code": "test",
            "state": ""
        },
        "defaultPaymentMethod": {
            "brand": "visa",
            "country": "US",
            "expMonth": 4,
            "expYear": 2024,
            "id": "pm_1OJqfSCzjFajHovdEN8RvPf8",
            "last4": "4242"
        },
        "email": "min.kim+nopayment15@canonical.com",
        "name": "MIn Kim"
    }
}
