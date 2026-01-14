"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
const handleDuplicateError = (err) => {
    // Extract field name and value from error message
    const match = err.message.match(/"([^"]*)"/);
    const extractedValue = match && match[1];
    // Extract field name from error keyPattern
    const fieldName = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    // Create user-friendly field names
    const fieldDisplayNames = {
        phoneNo: 'Phone number',
        email: 'Email address',
        nid: 'National ID (NID)',
    };
    const displayName = fieldDisplayNames[fieldName] || fieldName;
    const errorSources = [
        {
            path: fieldName,
            message: `${displayName} "${extractedValue}" is already registered. Please use a different ${displayName.toLowerCase()}.`,
        },
    ];
    const statusCode = 409;
    return {
        statusCode,
        message: `${displayName} already exists`,
        errorSources,
    };
};
exports.default = handleDuplicateError;
