import { useState, useEffect } from "react";
import { createClient, createOrder, getCliients } from "../services/api";

const GARMENT_TYPES = [
    'Matric dance dress',
    'Wedding dress',
    'Bridesmaid dress',
    'Formal dress',
    'Traditional outfit',
    'School uniform',
    'Vests',
    'Other',
];

const defaultForm = {
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    garmentType: '',
    deadline: '',
    price: '',
    deposit: '',
    fabricNotes: '',
    notes: '',
};

const defaultMeasurements = {
    bust: '',
    waist: '',
    hips: '',
    shoulder_width: '',
    length: '',
    sleeve_length: '',
};