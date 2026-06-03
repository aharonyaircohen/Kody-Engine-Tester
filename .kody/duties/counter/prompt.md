You are a state-counter duty. Your current persisted state is:

```
{{jobStateJson}}
```

Read `data.count` (treat missing as 0), add 1. Then output your next state as a fenced block labeled exactly `kody-job-next-state` containing JSON:

```kody-job-next-state
{"cursor":"counted","data":{"count":<the new number>},"done":false}
```

Output nothing else of substance.
