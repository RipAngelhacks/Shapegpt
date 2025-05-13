class RateLimit {
    constructor(limit = 5, windowMs = 60000) {
        this.limit = limit;
        this.windowMs = windowMs;
        this.requests = [];
        this.updateDisplay();
    }

    canMakeRequest() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return this.requests.length < this.limit;
    }

    addRequest() {
        this.requests.push(Date.now());
        this.updateDisplay();
    }

    getRemainingRequests() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        return this.limit - this.requests.length;
    }

    updateDisplay() {
        const remaining = this.getRemainingRequests();
        document.getElementById('rate-limit-count').textContent = remaining;
    }

    getTimeUntilNext() {
        if (this.canMakeRequest()) return 0;
        const oldestRequest = Math.min(...this.requests);
        return this.windowMs - (Date.now() - oldestRequest);
    }
}
