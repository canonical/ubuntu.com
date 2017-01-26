with open('endpoints.txt') as endpoints:
    lines = endpoints.read()

endpoints = [l[2:-5] for l in lines.split()]

no_indecies = map(
    lambda e: e[:-len("/index")] if e.endswith("/index") else e,
    endpoints
)

prefixed = ["https://www.ubuntu.com/" + str(e) for e in no_indecies]

print("\n".join(prefixed))
