import * as React from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import useAuth from "../../hooks/useAuth";

const textTitle = {
  fontFamily: "Inter",
  fontSize: "24px",
  fontWeight: 600,
  lineHeight: "32px",
  textAlign: "center",
  color: "#101828",
};

const textSectionTitle = {
  fontFamily: "Inter",
  fontSize: "16px",
  fontWeight: 600,
  lineHeight: "24px",
  color: "#101828",
};

const textBody = {
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "22px",
  color: "#344054",
};

export default function MutualNDAPage() {
  const { userInfo, currentCompany } = useAuth();
  const formatDisplayLabel = (value) => {
    if (!value) return value;

    // Convert string to display format
    let displayValue = value.toString();

    // Handle cases like "site_ID" to "Site ID"
    displayValue = displayValue.replace(
      /_([a-zA-Z])/g,
      (match, letter) => ` ${letter.toUpperCase()}`
    );

    // Handle cases with dots like ". one two" to "One Two"
    displayValue = displayValue.replace(/^\.\s*/, "");

    // Capitalize first letter of each word
    displayValue = displayValue
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return displayValue;
  };

  const isPremiumCompany = Boolean(currentCompany?.unlimited_data_upload);

  const accountName = isPremiumCompany
    ? formatDisplayLabel(currentCompany?.companyName) || userInfo?.userName || "Account Name"
    : userInfo?.userName || "Account Name";

  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${today.getFullYear()}`;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#FFFFFF",
        py: 2,
        padding: "82px 0px 30px 0px",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Typography sx={textTitle}>
            MUTUAL&nbsp;NON-DISCLOSURE&nbsp;AGREEMENT
          </Typography>

          <Typography sx={textBody}>
            This Mutual Non-Disclosure Agreement (this &ldquo;Agreement&rdquo;)
            is made as on this&nbsp;
            <strong>{formattedDate}</strong> and is entered by and between{" "}
            <strong>{accountName}</strong> and{" "}
            <strong>
              TRUEGRADIENT ARTIFICIAL INTELLIGENCE PRIVATE LIMITED
            </strong>
            , a company registered under the Companies Act 2013, having its
            place of business at Flat J602, Durga Petals Apartment, Outer Ring
            Road, Rainbow Children Hospital, Doddanekkundi, Bangalore
            North,Bangalore-560037,Karnataka (&ldquo;TRUEGRADIENT&rdquo;).
          </Typography>

          <Typography sx={textBody}>
            The TRUEGRADIENT and Company shall individually be known as
            &lsquo;Party&rsquo; or collectively known as &lsquo;Parties&rsquo;.
          </Typography>

          <Typography sx={textBody}>
            The Information disclosed under this Agreement is for potential
            business transaction (&ldquo;Transaction&rdquo;). In connection with
            the Transaction, TRUEGRADIENT and the Company shall disclose to each
            other certain confidential information for the Transaction purpose
            only and shall protect such confidential information from any
            unauthorized disclosure and use.
          </Typography>

          <Typography sx={textBody}>
            The Party receiving such Confidential Information will be the
            &lsquo;Receiving Party&rsquo; and Party disclosing Confidential
            Information shall be known as &lsquo;Disclosing Party&rsquo;.
          </Typography>

          <Typography sx={textBody}>
            In consideration of disclosure by the other Party of its
            Confidential Information, each Party agrees as follows:
          </Typography>

          <Typography sx={textSectionTitle}>
            1. Confidential Information
          </Typography>

          <Typography sx={textBody}>
            &ldquo;Confidential Information&rdquo; shall mean information
            relating to the processes, data, research, business, clients,
            customers and business practices of the Disclosing Party and shall
            include but not be limited to advertising, software, platform,
            marketing, operational, scientific, commercial, administrative,
            financial, business, technical, employees data or intellectual
            property nature or otherwise, whether disclosed in oral or written
            form, relating to either Party and any other information that is
            reasonably determined to be proprietary or confidential in nature.
          </Typography>

          <Typography sx={textSectionTitle}>
            2. Obligations of Confidentiality
          </Typography>

          <Typography sx={textBody}>
            Each Party agrees: (i) to maintain the Confidential Information of
            the other Party in strict confidence; (ii) not to use any such
            Confidential Information for any other purpose or Transaction except
            as agreed in this Agreement; and (iii) not to disclose such
            Confidential Information to any third parties. Each Party may
            disclose the Confidential Information of the other Party only to its
            employees and consultants on a need-to-know basis who have a bona
            fide reason to know such Confidential Information for the
            fulfillment of the Transaction and such employee or consultant shall
            be bound by similar obligations of confidentiality which are not
            less stringent than those mentioned in this Agreement. The
            disclosure of such Confidential Information to any other third party
            shall be only with the prior written consent of the Disclosing
            Party. However, a Party may disclose the other Party&rsquo;s
            Confidential Information only to the extent required by any law or
            regulation; provided that the Party required to make such a
            disclosure uses efforts to give the other Party reasonable advance
            notice of such required disclosure, to the extent legally
            permissible, in order to enable the other Party to prevent or limit
            such disclosure.
          </Typography>

          <Typography sx={textSectionTitle}>
            3. Ownership and No License
          </Typography>

          <Typography sx={textBody}>
            All Confidential Information remains the sole and exclusive property
            of the Disclosing Party. Each Party acknowledges and agrees that
            nothing in this Agreement will be construed as granting any rights
            to the Receiving Party, by way of license or otherwise, in or to any
            Confidential Information of the Disclosing Party, or proprietary
            rights or any patent, trademarks, copyright or other intellectual
            property of the Disclosing Party, except as specified in this
            Agreement.
          </Typography>

          <Typography sx={textSectionTitle}>
            4. Exclusions from Confidential Information
          </Typography>

          <Typography sx={textBody}>
            Confidential Information will not include information which:
          </Typography>
          <Typography sx={textBody} component="div">
            <ul style={{ marginTop: 0, paddingLeft: "20px" }}>
              <li>
                (i) is now or thereafter becomes generally known or available to
                the public, through no default act or omission by the Receiving
                Party; or
              </li>
              <li>
                (ii) was known to the Receiving Party prior to receiving such
                information from the Disclosing Party and without restriction as
                to use or disclosure; or
              </li>
              <li>
                (iii) is rightfully acquired by the Receiving Party from any
                third party who has the right to disclose it and who provides it
                without restriction as to use or disclosure; or
              </li>
              <li>
                (iv) is independently developed by or for the Receiving Party
                without any access to Confidential Information of the Disclosing
                Party.
              </li>
            </ul>
          </Typography>

          <Typography sx={textSectionTitle}>
            5. Return or Destruction of Confidential Information
          </Typography>

          <Typography sx={textBody}>
            Upon termination or expiry of this Agreement or when the Transaction
            is not achieved or upon the Disclosing Party&apos;s written request,
            the Receiving Party will promptly return or certify destruction
            thereof to the Disclosing Party all tangible items and embodiments
            containing or consisting of the Disclosing Party&apos;s Confidential
            Information and all copies thereof (including electronic copies).
            However, a Party may retain a copy of Confidential Information as
            per applicable law to the extent required for maintaining proper
            professional records. Such retained documentation will continue to
            be bound by the confidentiality obligations contained in this
            Agreement.
          </Typography>

          <Typography sx={textSectionTitle}>
            6. No Obligation to Proceed
          </Typography>

          <Typography sx={textBody}>
            Each Party agrees that unless and until a final service agreement
            between the Parties with respect to the Transaction has been
            executed and delivered, neither Party will be under any legal
            obligation of any kind whatsoever with respect to achievement of
            such Transaction whether through written or oral expression by any
            of their managers, directors, officers, employees, stockholders,
            agents, or any other representatives, fiduciaries or advisors.
          </Typography>

          <Typography sx={textSectionTitle}>
            7. &ldquo;As Is&rdquo; Information; No Warranty
          </Typography>

          <Typography sx={textBody}>
            ALL CONFIDENTIAL INFORMATION IS PROVIDED BY THE DISCLOSING PARTY on
            an &ldquo;AS IS&rdquo; basis. Neither Party makes any
            representations or warranties as to the accuracy or completeness of
            the Confidential Information, it being understood that neither Party
            shall have any liability to the other Party resulting from the use
            of the Confidential Information supplied by the Disclosing Party,
            except as may be expressly provided in a services agreement entered
            between the Parties.
          </Typography>

          <Typography sx={textSectionTitle}>8. No Waiver</Typography>

          <Typography sx={textBody}>
            No delay or failure in exercising any right, power or privilege
            hereunder shall be construed to be a waiver thereof, nor shall any
            single or partial exercise thereof preclude any other or further
            exercise thereof or the exercise of any other right, power or
            privilege hereunder.
          </Typography>

          <Typography sx={textSectionTitle}>9. Equitable Relief</Typography>

          <Typography sx={textBody}>
            Each Party acknowledges that unauthorized use or disclosure or
            threatened disclosure of the Disclosing Party&apos;s Confidential
            Information may cause the Disclosing Party to incur irreparable harm
            and significant damages, the degree of which may be difficult to
            ascertain. Accordingly, each Party agrees that the Disclosing Party
            will have the right to obtain immediate equitable relief to enjoin
            any unauthorized use or disclosure or threatened disclosure of its
            Confidential Information, in addition to any other rights and
            remedies that it may have at law or otherwise.
          </Typography>

          <Typography sx={textSectionTitle}>
            10. Confidentiality of this Agreement
          </Typography>

          <Typography sx={textBody}>
            Both Parties shall treat the existence of this Agreement, its
            contents, and its subject matter as Confidential Information and
            require the prior written consent of the other Party prior to any
            public disclosure or acknowledgement of this Agreement, its contents
            or its Transaction except as stated in clause 2 above.
          </Typography>

          <Typography sx={textSectionTitle}>
            11. Governing Law and Jurisdiction; Data Privacy
          </Typography>

          <Typography sx={textBody}>
            This Agreement shall be governed by and construed in accordance with
            the laws of India and any dispute arising from or out of this
            Agreement shall be subject to the exclusive jurisdiction of the
            Bangalore courts. Either Party agrees to comply with the applicable
            data privacy laws.
          </Typography>

          <Typography sx={textSectionTitle}>12. Entire Agreement</Typography>

          <Typography sx={textBody}>
            This Agreement is the complete and exclusive statement regarding the
            Transaction and supersedes all prior agreements, commitments,
            understandings and communications, oral or written, between the
            Parties regarding the Transaction.
          </Typography>

          <Typography sx={textSectionTitle}>13. Assignment</Typography>

          <Typography sx={textBody}>
            Neither Party shall assign this Agreement, in whole nor in part,
            without the other Party&apos;s prior written consent, and any
            attempted assignment without such prior consent will be void.
          </Typography>

          <Typography sx={textSectionTitle}>14. Term</Typography>

          <Typography sx={textBody}>
            This Agreement shall commence on the date first set forth above and
            will remain in effect for five (5) years from the date of latest
            disclosure of Confidential Information by either Party, at which
            time it will terminate.
          </Typography>

          <Typography sx={textSectionTitle}>IN WITNESS WHEREOF</Typography>

          <Typography sx={textBody}>
            IN WITNESS WHEREOF, the Parties hereto have executed this Mutual
            Non-Disclosure Agreement by their duly authorized officers or
            representatives.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
