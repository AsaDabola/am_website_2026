import type { CollectionConfig } from "payload";
import { enforceTenantScope, hideUnlessGranted, submissionAccess } from "@/lib/adminAccess";
import { attributeToCountrySite } from "@/lib/submissionCountry";

export const VolunteerApplications: CollectionConfig = {
  slug: "volunteer-applications",
  hooks: { beforeValidate: [attributeToCountrySite] },
  admin: {
    hidden: hideUnlessGranted("volunteer-applications"),
    useAsTitle: "email",
    defaultColumns: ["fullName", "email", "tenant", "createdAt"],
  },
  access: submissionAccess("volunteer-applications"),
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      hooks: { beforeChange: [enforceTenantScope] },
      admin: {
        readOnly: true,
        description:
          "The country site this came in from, taken from the page the form was sent from. Empty means the main amintl.org site.",
      },
    },
    { name: "fullName", type: "text", required: true },
    { name: "address", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "city", type: "text", required: true },
        { name: "stateProvince", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "country", type: "text", required: true },
        { name: "zipCode", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "telephone", type: "text", required: true },
        { name: "email", type: "email", required: true },
      ],
    },
    { name: "availability", type: "text", required: true },
    { name: "whyVolunteer", type: "textarea", required: true },
    { name: "testimony", type: "textarea", required: true },
    { name: "giftsAndTalents", type: "textarea", required: true },
    { name: "churchOrgName", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "q1Convicted", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q1Explanation", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "q2SexualOffense", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q2Explanation", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "q3ReportedAgency", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q3Explanation", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "q4ChurchDiscipline", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q4Explanation", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "q5DismissedEmployment", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q5Explanation", type: "textarea" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "q6Investigation", type: "select", required: true, options: ["Yes", "No"] },
        { name: "q6Explanation", type: "textarea" },
      ],
    },
    { name: "signature", type: "text", required: true },
    { name: "signatureDate", type: "text", required: true },
  ],
  defaultSort: "-createdAt",
};
