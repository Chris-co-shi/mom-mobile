# Receiving page state matrix

| State | UI | Allowed action |
|---|---|---|
| READY | scan prompt | scan delivery |
| SCANNING | camera active | cancel |
| VALIDATED | delivery summary | scan container / submit |
| OFFLINE | orange badge | queue command |
| SYNCING | progress indicator | no duplicate submit |
| CONFLICT | reason and server snapshot | retry / manual handling |
| COMPLETED | receipt number and print action | next receipt |
