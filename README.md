# System Design – From Concepts to Code

> A hands-on repository where I implement classic **system design problems** in TypeScript — bridging the gap between whiteboard diagrams and production-grade thinking.

---

## About This Repository

Most system design practice stops at diagrams. This repo goes further: every design is **fully implemented**, runnable, and tested with simulated real-world scenarios.

The goal is to demonstrate that I don't just understand *what* to build — I understand *how* to build it.

---

## What You'll Find Here

| Problem | Concepts Covered | Status |
|---|---|---|
| [Parking Lot](./parking-lot/) | OOP Design, Multi-floor management, Dynamic pricing, Ticket system | ✅ Done |
| Rate Limiter | Token bucket, Sliding window, Distributed counters | 🔜 Coming |
| URL Shortener | Hashing, Collision handling, Caching, Redirect logic | 🔜 Coming |
| LRU Cache | Doubly linked list + HashMap, O(1) eviction | 🔜 Coming |
| Ride Sharing (Uber) | Matching algorithms, Geolocation, State machines | 🔜 Coming |
| Notification Service | Fan-out patterns, Priority queues, Delivery guarantees | 🔜 Coming |
| Distributed Cache | Consistent hashing, Replication, TTL management | 🔜 Coming |

---

## Deep Dive: Parking Lot System

### Problem
Design a parking lot that handles multiple vehicle types across multiple floors, issues tickets, calculates time-based fees, and manages spot availability in real time.

### Key Design Decisions

**Object-Oriented Hierarchy**
```
ParkingLot
  └── Floor[]
        └── ParkingSpot{}
```
Each layer has a single responsibility — `ParkingLot` orchestrates, `Floor` manages spots, `ParkingSpot` holds state.

**Smart Spot Assignment**
- Scans floors in order and returns the **nearest available spot** matching the vehicle type
- Prevents double-parking via ticket validation before assignment

**Time-Based Dynamic Pricing**
```
Car   → $100 / second
Bike  → $50  / second
Truck → $200 / second
```
Fees are calculated at unpark time using precise timestamps via `moment.js`.

**Ticket Lifecycle**
```
Park → Ticket Issued → Vehicle Enters Spot
                             ↓
Unpark → Fee Calculated → Spot Freed → Ticket Marked Lotted Out
```

**Simulation**
The entry point generates 30 random vehicles, parks them, then asynchronously unparks 8 of them with random delays — mimicking real-world concurrency and timing.

### Running It

```bash
cd parking-lot
npm install
npm start
```

### Sample Output
```
trying to park a Car with number AB12CD3456.
Parked Successfully — ticket XY98ZA1234. Floor 1 at spot 1A.

trying to unpark with ticket XY98ZA1234.
Vehicle unparked successfully. Collect amount $4200.
```

---

## Skills Demonstrated

- **Object-Oriented Design** — Encapsulation, interface contracts, single-responsibility classes
- **TypeScript** — Strict typing, enums, generics, interfaces
- **System Design Patterns** — State management, ID generation, fee calculation engines
- **Real-World Simulation** — Async flows, random data generation, edge case handling (duplicate parks, invalid tickets, full lots)
- **Clean Architecture** — Each system is self-contained with clear separation of concerns

---

## Why This Repo Exists

System design interviews test whether engineers can translate ambiguous requirements into working, scalable systems. This repo is my proof of work — not just that I can talk through designs, but that I can implement them cleanly.

Each solution is built to be:
- **Readable** — Any engineer should be able to understand it in minutes
- **Extensible** — New vehicle types, pricing strategies, or floors can be added without breaking existing logic
- **Realistic** — Simulated with real-world edge cases, not just happy-path demos

---

## Tech Stack

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat&logo=node.js&logoColor=white)
![tsx](https://img.shields.io/badge/tsx-runtime-646CFF?style=flat)

---

## Connect

If you're a recruiter or engineer interested in discussing these designs, feel free to reach out.

> More systems being added regularly — watch the repo to follow along.
