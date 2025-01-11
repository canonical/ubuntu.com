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

// post /account/customer-info${queryString}`
  export const customerInfoPost = {
    "createdAt": "2023-12-06T18:48:42Z",
    "externalAccountIDs": [
        {
            "IDs": [
                "cus_P8hYsgkn9vMYbx"
            ],
            "origin": "Stripe"
        }
    ],
    "id": "aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A",
    "lastModifiedAt": "0001-01-01T00:00:00Z",
    "name": "abcde",
    "type": "paid"
  }
  
  // post /pro/purchase/preview${window.location.search}`,
  export const postPurchasePreview = {
    "currency": "usd",
    "end_of_cycle": "",
    "id": "",
    "items": null,
    "payment_status": null,
    "reason": "subscription_create",
    "start_of_cycle": "",
    "status": "done",
    "tax_amount": null,
    "total": 50000,
    "url": null
  }
  
  // post /pro/purchase${window.location.search}
  export const postPurchase = {
      "accountID": "aAaBbCcDdEeFfGg",
      "createdAt": "2020-01-01T10:00:00Z",
      "createdBy": "abcdef",
      "id": "pAaBbCcDdEeFfGg",
      "invoice": {
        "amountDue": 1000,
        "amountPaid": 1000,
        "currency": "usd",
        "id": {
          "IDs": [
            "invoice_id"
          ],
          "origin": "Stripe"
        },
        "reason": "subscription_update",
        "status": "paid",
        "subscriptionID": {
          "IDs": [
            "randomId4"
          ],
          "origin": "Stripe"
        },
        "taxAmount": 200,
        "total": 1000
      },
      "lastModified": "2021-07-21T12:18:43.057Z",
      "marketplace": "canonical-ua",
      "purchaseItems": [
        {
          "productListingID": "lAaBbCcDdEeFfGg",
          "value": 1
        }
      ],
      "status": "done",
      "stripeInvoices": [
        {
          "id": "invoice_id",
          "last_update": "2020-01-01T10:00:00Z",
          "pi_status": "succeeded",
          "subscription_status": "active"
        }
      ],
      "subscriptionID": "sAaBbCcDdEeFfGg"
  }
  
  // /account/purchases/${purchaseID}${queryString}
  export const getPurchaseResponse = {
    "accountID": "aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A",
    "createdAt": "2023-12-06T18:48:47.585Z",
    "createdBy": "L4zm3xn",
    "id": "pAIUWWqMhL0NPk48dbylA8nxfjDh1lhC28jtJnUXzebA",
    "lastModified": "2023-12-06T18:48:50.343Z",
    "marketplace": "canonical-ua",
    "purchaseItems": [
        {
            "paidForInCycle": 2,
            "productListingID": "lADzGbq4gpOUmb-mT6U8k-H-J7VFZYBbFaQJZHmAQSLs",
            "value": 2
        }
    ],
    "status": "done",
    "subscriptionID": "sALNCX77nsuXYVZDZG_k6IpCR81lRKoiS-fDb4ZwKKfE"
  }

  export const postInvoiceResponse = {
    "accountID": "aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A",
    "createdAt": "2023-12-06T18:48:47.585Z",
    "createdBy": "L4zm3xn",
    "end": "2024-12-06T18:48:48Z",
    "id": "pAIUWWqMhL0NPk48dbylA8nxfjDh1lhC28jtJnUXzebA",
    "invoice": {
        "amountDue": 54000,
        "amountPaid": 54000,
        "currency": "usd",
        "customerAddress": {
            "city": "abcd",
            "country": "FR",
            "line1": "abcd",
            "line2": "",
            "postal_code": "abcd",
            "state": ""
        },
        "customerEmail": "min.kim+new@canonical.com",
        "customerName": "abcde",
        "id": {
            "IDs": [
                "in_1OKQ9MCzjFajHovdrVmszv6Q"
            ],
            "origin": "Stripe"
        },
        "identifier": "C41F3A29-0001",
        "lineItems": [
            {
                "currency": "usd",
                "description": "2 x Ubuntu Pro (Infra-only) (at $225.00 / year)",
                "planID": {
                    "IDs": [
                        "CO4VF1902"
                    ],
                    "origin": "Stripe"
                },
                "proRatedAmount": 45000,
                "quantity": 2
            }
        ],
        "paid": true,
        "paidAt": "2023-12-06T18:48:48Z",
        "paymentStatus": {
            "status": "paid"
        },
        "reason": "subscription_create",
        "status": "paid",
        "subscriptionID": {
            "IDs": [
                "sub_1OKQ9MCzjFajHovdICAATNUg"
            ],
            "origin": "Stripe"
        },
        "taxAmount": 9000,
        "total": 54000,
        "url": "https://pay.stripe.com/invoice/acct_1GH9uHCzjFajHovd/test_YWNjdF8xR0g5dUhDempGYWpIb3ZkLF9QOGhZbnJMTEtmTnJRZ1ZxNmdtblRTYkFpSTI5MThwLDkyNDI5MzQw02007D7sWxQg/pdf?s=ap"
    },
    "lastModified": "2023-12-06T18:48:55.511Z",
    "marketplace": "canonical-ua",
    "purchaseItems": [
        {
            "paidForInCycle": 2,
            "productListingID": "lADzGbq4gpOUmb-mT6U8k-H-J7VFZYBbFaQJZHmAQSLs",
            "value": 2
        }
    ],
    "start": "2023-12-06T18:48:48Z",
    "status": "done",
    "stripeInvoices": [
        {
            "id": "in_1OKQ9MCzjFajHovdrVmszv6Q",
            "last_update": "2023-12-06T18:48:53.67Z",
            "pi_status": "succeeded",
            "subscription_status": "active"
        }
    ],
    "subscriptionID": "sALNCX77nsuXYVZDZG_k6IpCR81lRKoiS-fDb4ZwKKfE"
  }

  // post_calculate 
  export const postCalculate = {
    "currency": "USD",
    "subtotal": 450000,
    "tax": 0,
    "total": 450000
  }
  
  export const postCalculateWithTax = {
    "currency": "USD",
    "subtotal": 45000,
    "tax": 9000,
    "total": 54000
  }
  
  export const postEnsureResponse = {
    "id": "aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A",
    "name": null,
    "role": null,
    "token": null,
    "type": null
  }
  
  export const paymentMethodResponse = {
    "id": "pm_1OKQ9GCzjFajHovdLN8THd3p",
    "object": "payment_method",
    "billing_details": {
        "address": {
            "city": "abcd",
            "country": "FR",
            "line1": "abcd",
            "line2": null,
            "postal_code": "42424",
            "state": ""
        },
        "email": "min.kim+new@canonical.com",
        "name": "new",
        "phone": null
    },
    "card": {
        "brand": "visa",
        "checks": {
            "address_line1_check": null,
            "address_postal_code_check": null,
            "cvc_check": null
        },
        "country": "US",
        "exp_month": 4,
        "exp_year": 2024,
        "funding": "credit",
        "generated_from": null,
        "last4": "4242",
        "networks": {
            "available": [
                "visa"
            ],
            "preferred": null
        },
        "three_d_secure_usage": {
            "supported": true
        },
        "wallet": null
    },
    "created": 1701888522,
    "customer": null,
    "livemode": false,
    "type": "card"
  }
  
  export const subscriptions = [
    {
        "account_id": "aAHrg0aPSEy6XuvHk4wYpUKfiZ9gvMvrFJX87CgGLxoI",
        "contract_id": "cAcRekzmrHZG5PXkd0Is4QAcQigPNhrbNpAnSuX8koQY",
        "currency": "USD",
        "current_number_of_machines": 0,
        "end_date": null,
        "entitlements": [
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "cis"
            },
            {
                "enabled_by_default": true,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "esm-apps"
            },
            {
                "enabled_by_default": true,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "esm-infra"
            },
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": false,
                "is_in_beta": false,
                "support_level": null,
                "type": "fips"
            },
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "fips-updates"
            },
            {
                "enabled_by_default": true,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "livepatch"
            }
        ],
        "id": "free||aAHrg0aPSEy6XuvHk4wYpUKfiZ9gvMvrFJX87CgGLxoI||cAcRekzmrHZG5PXkd0Is4QAcQigPNhrbNpAnSuX8koQY",
        "listing_id": null,
        "machine_type": "physical",
        "marketplace": "free",
        "number_of_active_machines": 0,
        "number_of_machines": 5,
        "period": null,
        "price": null,
        "product_name": "Free Personal Token",
        "renewal_id": null,
        "start_date": "2023-12-06T20:29:10Z",
        "statuses": {
            "has_access_to_support": true,
            "has_access_to_token": true,
            "has_pending_purchases": false,
            "is_cancellable": false,
            "is_cancelled": false,
            "is_downsizeable": false,
            "is_expired": false,
            "is_expiring": false,
            "is_in_grace_period": false,
            "is_renewable": false,
            "is_renewal_actionable": false,
            "is_renewed": false,
            "is_subscription_active": false,
            "is_subscription_auto_renewing": false,
            "is_trialled": false,
            "is_upsizeable": false,
            "should_present_auto_renewal": false
        },
        "subscription_id": null,
        "type": "free"
    },
    {
        "account_id": "aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A",
        "contract_id": "cAHt29tU3ckpALgOOaZ5HR0girJMQPIWqrXdxm7s3pas",
        "currency": "USD",
        "current_number_of_machines": 2,
        "end_date": "2024-12-06T18:48:48Z",
        "entitlements": [
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "cis"
            },
            {
                "enabled_by_default": true,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "esm-infra"
            },
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": false,
                "is_in_beta": false,
                "support_level": null,
                "type": "fips"
            },
            {
                "enabled_by_default": false,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "fips-updates"
            },
            {
                "enabled_by_default": true,
                "is_available": true,
                "is_editable": true,
                "is_in_beta": false,
                "support_level": null,
                "type": "livepatch"
            },
            {
                "enabled_by_default": false,
                "is_available": false,
                "is_editable": false,
                "is_in_beta": false,
                "support_level": null,
                "type": "esm-apps"
            }
        ],
        "id": "yearly||aAINI96WQv-l2yAHBv68YxhhL-dDsJ0H1poiQe8Ee-1A||cAHt29tU3ckpALgOOaZ5HR0girJMQPIWqrXdxm7s3pas||sALNCX77nsuXYVZDZG_k6IpCR81lRKoiS-fDb4ZwKKfE",
        "listing_id": "lADzGbq4gpOUmb-mT6U8k-H-J7VFZYBbFaQJZHmAQSLs",
        "machine_type": "physical",
        "marketplace": "canonical-ua",
        "number_of_active_machines": 0,
        "number_of_machines": 2,
        "period": "yearly",
        "price": 45000,
        "product_name": "Ubuntu Pro (Infra-only)",
        "renewal_id": null,
        "start_date": "2023-12-06T18:48:48Z",
        "statuses": {
            "has_access_to_support": true,
            "has_access_to_token": true,
            "has_pending_purchases": false,
            "is_cancellable": true,
            "is_cancelled": false,
            "is_downsizeable": true,
            "is_expired": false,
            "is_expiring": false,
            "is_in_grace_period": false,
            "is_renewable": false,
            "is_renewal_actionable": false,
            "is_renewed": true,
            "is_subscription_active": true,
            "is_subscription_auto_renewing": true,
            "is_trialled": false,
            "is_upsizeable": true,
            "should_present_auto_renewal": true
        },
        "subscription_id": "sALNCX77nsuXYVZDZG_k6IpCR81lRKoiS-fDb4ZwKKfE",
        "type": "yearly"
    }
  ]
