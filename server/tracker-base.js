class StatusError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StatusError';
    }
}

module.exports = {
    StatusError: StatusError,
    errors: {
        empty: 1,
        notExists: 2,
        wrongData: 3
    },
    status: {
        code: '',
        status: 4,
        date: new Date(0),
        location: 'Unknown',
        delivered: false,
        deliveryInfo: {
            destination: 'Unknown',
            receiver: 'Unknown',
            receiverId: 'Unknown',
            date: new Date(0),
            estimatedDelivery: new Date(9999999999)
        }
    }
};