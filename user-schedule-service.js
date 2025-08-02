document.addEventListener("DOMContentLoaded", () => {
  // Get form sections
  const scheduleFormSection = document.getElementById("schedule-form-section")
  const step1ReviewSection = document.getElementById("step1-review-section")
  const acknowledgementSection = document.getElementById("acknowledgement-section")
  const paymentSection = document.getElementById("payment-section")
  const receiptSection = document.getElementById("receipt-section")

  // Get navigation buttons
  const nextBtn = document.getElementById("next-btn")
  const editStep1Btn = document.getElementById("edit-step1-btn")
  const confirmStep1Btn = document.getElementById("confirm-step1-btn")
  const backToStep1ReviewBtn = document.getElementById("back-to-step1-review-btn")
  const toPaymentBtn = document.getElementById("to-payment-btn")
  const backToAcknowledgementBtn = document.getElementById("back-to-acknowledgement-btn")
  const payWithGcashBtn = document.getElementById("pay-with-gcash-btn")
  const verifyPaymentBtn = document.getElementById("verify-payment-btn")
  const cancelScheduleBtn = document.getElementById("cancel-schedule-btn")
  const acknowledgementTerms = document.getElementById("acknowledgementTerms")
  const printReceiptBtn = document.getElementById("print-receipt-btn")
  const returnDashboardBtn = document.getElementById("return-dashboard-btn")

  // Form fields
  const serviceTypeSelect = document.getElementById("serviceTypeSelect")
  const dynamicServiceFields = document.getElementById("dynamic-service-fields")
  const gcashNumber = document.getElementById("gcashNumber")
  const paymentAmount = document.getElementById("paymentAmount")
  const verificationCode = document.getElementById("verification-code")

  // Progress steps
  const progressSteps = document.querySelectorAll(".progress-step")

  // Service fees
  const fees = {
    BAPTISM: 600,
    CONFIRMATION: 600,
    COMMUNION: 600,
    WEDDING: 4000,
    FUNERAL: 600,
    INTENTION: 100,
  }

  // Service names
  const serviceNames = {
    BAPTISM: "BINYAG (BAPTISM)",
    CONFIRMATION: "KUMPIL (CONFIRMATION)",
    COMMUNION: "UNANG KOMUNYON (FIRST COMMUNION)",
    WEDDING: "KASAL (WEDDING)",
    FUNERAL: "LIBING (FUNERAL)",
    INTENTION: "INTENSYON SA MISA (MASS INTENTION)",
  }

  // Philippines provinces and cities data
  const philippinesData = {
    "METRO MANILA": [
      "CALOOCAN",
      "LAS PIÑAS",
      "MAKATI",
      "MALABON",
      "MANDALUYONG",
      "MANILA",
      "MARIKINA",
      "MUNTINLUPA",
      "NAVOTAS",
      "PARAÑAQUE",
      "PASAY",
      "PASIG",
      "PATEROS",
      "QUEZON CITY",
      "SAN JUAN",
      "TAGUIG",
      "VALENZUELA",
    ],
    CAVITE: [
      "ALFONSO",
      "AMADEO",
      "BACOOR",
      "CARMONA",
      "CAVITE CITY",
      "DASMARIÑAS",
      "GENERAL EMILIO AGUINALDO",
      "GENERAL MARIANO ALVAREZ",
      "GENERAL TRIAS",
      "IMUS",
      "INDANG",
      "KAWIT",
      "MAGALLANES",
      "MARAGONDON",
      "MENDEZ",
      "NAIC",
      "NOVELETA",
      "ROSARIO",
      "SILANG",
      "TAGAYTAY",
      "TANZA",
      "TERNATE",
      "TRECE MARTIRES",
    ],
    LAGUNA: [
      "ALAMINOS",
      "BAY",
      "BIÑAN",
      "CABUYAO",
      "CALAMBA",
      "CALAUAN",
      "CAVINTI",
      "FAMY",
      "KALAYAAN",
      "LILIW",
      "LOS BAÑOS",
      "LUISIANA",
      "LUMBAN",
      "MABITAC",
      "MAGDALENA",
      "MAJAYJAY",
      "NAGCARLAN",
      "PAETE",
      "PAGSANJAN",
      "PAKIL",
      "PANGIL",
      "PILA",
      "RIZAL",
      "SAN PABLO",
      "SAN PEDRO",
      "SANTA CRUZ",
      "SANTA MARIA",
      "SANTA ROSA",
      "SINILOAN",
      "VICTORIA",
    ],
  }

  // Counters
  let principalNinongCount = 0
  let principalNinangCount = 0
  let secondaryNinongCount = 0
  let secondaryNinangCount = 0
  let sponsorCount = 0
  let weddingNinongCount = 0
  let weddingNinangCount = 0
  let intentionNamesCount = 0
  const maxPrincipalSponsors = 1
  const maxSecondarySponsors = 5
  const maxConfirmationSponsors = 2
  const maxWeddingSponsors = 5

  // Current state
  let selectedService = ""

  // Service-specific fields with English beside Tagalog
  const serviceFields = {
    BAPTISM: `
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredBaptismDate" name="preferredBaptismDate" required>
              </div>
          </div>
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredBaptismTime" name="preferredBaptismTime" required>
                      <option value="" disabled selected>PUMILI NG ORAS (Select Time)</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                  </select>
              </div>
          </div>
      </div>
      <h3>
        <i class="fas fa-baby"></i> Pangalan ng Bibinyagan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Child's Name
        </span>
      </h3>
      <div class="uppercase-info">
          <i class="fas fa-info-circle"></i> Lahat ng teksto ay magiging MALAKING TITIK
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            All text will be in UPPERCASE
          </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="childLastName" name="childLastName" required>
              </div>
          </div>
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="childFirstName" name="childFirstName" required>
              </div>
          </div>
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="childMiddleName" name="childMiddleName">
              </div>
          </div>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Kasarian <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender
                </span>
              </label>
              <div class="select-field">
                  <select id="childGender" name="childGender" required>
                      <option value="" disabled selected>PUMILI NG KASARIAN (Select Gender)</option>
                      <option value="LALAKI">LALAKI (Male)</option>
                      <option value="BABAE">BABAE (Female)</option>
                  </select>
              </div>
          </div>
      </div>
      <h3>
        <i class="fas fa-map-marker-alt"></i> Lugar at Petsa ng Kapanganakan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Place and Date of Birth
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Probinsya <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Province
                </span>
              </label>
              <div class="select-field">
                  <select id="birthProvince" name="birthProvince" required onchange="updateCities('birth')">
                      <option value="" disabled selected>PUMILI NG PROBINSYA (Select Province)</option>
                      ${Object.keys(philippinesData)
                        .map((province) => `<option value="${province}">${province}</option>`)
                        .join("")}
                  </select>
              </div>
          </div>
          <div class="form-group">
              <label>
                Lungsod/Bayan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  City/Municipality
                </span>
              </label>
              <div class="select-field">
                  <select id="birthCity" name="birthCity" required disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PROBINSYA (Select Province First)</option>
                  </select>
              </div>
          </div>
          <div class="form-group">
              <label>
                Petsa ng Kapanganakan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Birth
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="childBirthDate" name="childBirthDate" required>
              </div>
          </div>
      </div>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Birth Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Birth Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="birthCertificate" name="birthCertificate" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <!-- Father Information -->
      <h3>
        <i class="fas fa-male"></i> Impormasyon ng Ama
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Father's Information
        </span>
      </h3> 
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherLastName" name="fatherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherFirstName" name="fatherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherMiddleName" name="fatherMiddleName">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Probinsya ng Kapanganakan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Province of Birth
                </span>
              </label>
              <div class="select-field">
                  <select id="fatherBirthProvince" name="fatherBirthProvince" onchange="updateCities('father')">
                      <option value="" disabled selected>PUMILI NG PROBINSYA</option>
                      ${Object.keys(philippinesData)
                        .map((province) => `<option value="${province}">${province}</option>`)
                        .join("")}
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Lungsod/Bayan ng Kapanganakan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  City/Municipality of Birth
                </span>
              </label>
              <div class="select-field">
                  <select id="fatherBirthCity" name="fatherBirthCity" disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PROBINSYA</option>
                  </select>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Pre-Jordan Seminar Card ng Ama
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Father's Pre-Jordan Seminar Card
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="fatherPreJordanCard" name="fatherPreJordanCard" accept="image/*,.pdf">
              </div>
          </div>
      </div>

      <!-- Mother Information -->
      <h3>
        <i class="fas fa-female"></i> Impormasyon ng Ina
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Mother's Information
        </span>
      </h3>
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherLastName" name="motherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherFirstName" name="motherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherMiddleName" name="motherMiddleName">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Probinsya ng Kapanganakan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Province of Birth
                </span>
              </label>
              <div class="select-field">
                  <select id="motherBirthProvince" name="motherBirthProvince" onchange="updateCities('mother')">
                      <option value="" disabled selected>PUMILI NG PROBINSYA</option>
                      ${Object.keys(philippinesData)
                        .map((province) => `<option value="${province}">${province}</option>`)
                        .join("")}
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Lungsod/Bayan ng Kapanganakan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  City/Municipality of Birth
                </span>
              </label>
              <div class="select-field">
                  <select id="motherBirthCity" name="motherBirthCity" disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PROBINSYA</option>
                  </select>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Pre-Jordan Seminar Card ng Ina
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Mother's Pre-Jordan Seminar Card
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="motherPreJordanCard" name="motherPreJordanCard" accept="image/*,.pdf">
              </div>
          </div>
      </div>

      <!-- Marriage Status -->
      <h3>
        <i class="fas fa-heart"></i> Kasal Sa
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Married At
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Uri ng Kasal <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Type of Marriage
                </span>
              </label>
              <div class="select-field">
                  <select id="marriageType" name="marriageType" required>
                      <option value="" disabled selected>PUMILI NG URI</option>
                      <option value="SIMBAHAN">Simbahan</option>
                      <option value="CIVIL">Civil</option>
                      <option value="HINDI_KASAL">Hindi Kasal</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Contact Information -->
      <h3>
        <i class="fas fa-address-book"></i> Impormasyon sa Pakikipag-ugnayan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Contact Information
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Tirahan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Address
                </span>
              </label>
              <div class="input-field">
                  <textarea id="baptismCompleteAddress" name="baptismCompleteAddress" required placeholder="Kumpleto at detalyadong address"></textarea>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Cellphone No. <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Cellphone Number
                </span>
              </label>
              <div class="input-field">
                  <input type="tel" id="baptismCellphone" name="baptismCellphone" required placeholder="09XXXXXXXXX">
              </div>
          </div>
      </div>

      <!-- Principal Sponsors Section -->
      <h3>
        <i class="fas fa-users"></i> Principal na Ninong at Ninang
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Principal Godparents
        </span>
      </h3>
      <div class="godparents-info">
          <i class="fas fa-info-circle"></i> Kailangan ng 1 ninong at 1 ninang (required).
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            1 godfather and 1 godmother required.
          </span>
      </div>

      <!-- Principal Ninong Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-tie"></i> Principal na Ninong (Required)
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Principal Godfather (Required)
            </span>
          </h4>
          <div id="principalNinongContainer"></div>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addPrincipalNinongBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Principal na Ninong
              </button>
          </div>
      </div>

      <!-- Principal Ninang Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-friends"></i> Principal na Ninang (Required)
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Principal Godmother (Required)
            </span>
          </h4>
          <div id="principalNinangContainer"></div>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addPrincipalNinangBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Principal na Ninang
              </button>
          </div>
      </div>

      <!-- Secondary Sponsors Section -->
      <h3>
        <i class="fas fa-users"></i> Secondary Sponsors (Optional)
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Secondary Sponsors (Optional)
        </span>
      </h3>
      <div class="godparents-info">
          <i class="fas fa-info-circle"></i> Maaaring magdagdag ng hanggang 5 ninong at 5 ninang na secondary sponsors.
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            May add up to 5 godfathers and 5 godmothers as secondary sponsors.
          </span>
      </div>

      <!-- Secondary Ninong Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-tie"></i> Secondary na mga Ninong
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Secondary Godfathers
            </span>
          </h4>
          <div id="secondaryNinongContainer"></div>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addSecondaryNinongBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Secondary na Ninong
              </button>
          </div>
      </div>

      <!-- Secondary Ninang Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-friends"></i> Secondary na mga Ninang
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Secondary Godmothers
            </span>
          </h4>
          <div id="secondaryNinangContainer"></div>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addSecondaryNinangBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Secondary na Ninang
              </button>
          </div>
      </div>

      <!-- Parish Permit -->
      <h3>
        <i class="fas fa-file-alt"></i> Permit sa Parokya
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Parish Permit
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Copy ng permit galing sa parokyang kinabibilangan kung hindi naninirahan sa Brgy Tambo, Sico, o San Salvador
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Copy of permit from your parish if not residing in Brgy Tambo, Sico, or San Salvador
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="parishPermit" name="parishPermit" accept="image/*,.pdf">
              </div>
          </div>
      </div>
    `,

    CONFIRMATION: `
      <!-- Preferred Schedule -->
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredConfirmationDate" name="preferredConfirmationDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredConfirmationTime" name="preferredConfirmationTime" required>
                      <option value="" disabled selected>PUMILI NG ORAS</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Confirmand Information -->
      <h3>
        <i class="fas fa-user-graduate"></i> Pangalan ng Kukumpilan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Name of Confirmand
        </span>
      </h3>
      <div class="uppercase-info">
          <i class="fas fa-info-circle"></i> Lahat ng teksto ay magiging MALAKING TITIK
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            All text will be in UPPERCASE
          </span>
      </div>
      
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandLastName" name="confirmandLastName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandFirstName" name="confirmandFirstName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandMiddleName" name="confirmandMiddleName">
              </div>
          </div>
      </div>

      <!-- Gender -->
      <div class="form-row">
          <div class="form-group">
              <label>
                Kasarian <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender
                </span>
              </label>
              <div class="select-field">
                  <select id="confirmandGender" name="confirmandGender" required>
                      <option value="" disabled selected>PUMILI NG KASARIAN</option>
                      <option value="LALAKI">LALAKI</option>
                      <option value="BABAE">BABAE</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Place and Date of Birth -->
      <h3>
        <i class="fas fa-map-marker-alt"></i> Lugar ng Kapanganakan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Place of Birth
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Probinsya <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Province
                </span>
              </label>
              <div class="select-field">
                  <select id="confirmandBirthProvince" name="confirmandBirthProvince" required onchange="updateCities('confirmandBirth')">
                      <option value="" disabled selected>PUMILI NG PROBINSYA</option>
                      ${Object.keys(philippinesData)
                        .map((province) => `<option value="${province}">${province}</option>`)
                        .join("")}
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Lungsod/Bayan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  City/Municipality
                </span>
              </label>
              <div class="select-field">
                  <select id="confirmandBirthCity" name="confirmandBirthCity" required disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PROBINSYA</option>
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Petsa ng Kapanganakan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Birth
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="confirmandBirthDate" name="confirmandBirthDate" required onchange="calculateAge('confirmand')">
              </div>
          </div>
      </div>

      <!-- Baptized At -->
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Bininyagan Sa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Baptized At
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="baptizedAt" name="baptizedAt" required placeholder="Pangalan ng simbahan kung saan bininyagan">
              </div>
          </div>
      </div>

      <!-- Age (Auto-calculated) -->
      <div class="form-row">
          <div class="form-group">
              <label>
                Edad <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Age
                </span>
              </label>
              <div class="input-field">
                  <input type="number" id="confirmandAge" name="confirmandAge" min="10" required readonly placeholder="Awtomatikong makakalkula mula sa petsa ng kapanganakan">
              </div>
              <small class="age-info">
                Edad ay awtomatikong makakalkula kapag nalagay na ang petsa ng kapanganakan. Dapat 10 taon pataas.
                <br>
                <span style="font-style: italic; font-size: 0.92em; color: #888;">
                  Age will be automatically calculated when birth date is entered. Must be 10 years old and above.
                </span>
              </small>
          </div>
      </div>

      <!-- Certificate Uploads -->
      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang Baptismal Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Baptismal Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="confirmandBaptismalCert" name="confirmandBaptismalCert" accept="image/*,.pdf" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                I-upload ang First Communion Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload First Communion Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="confirmandCommunionCert" name="confirmandCommunionCert" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <!-- Father Information -->
      <h3>
        <i class="fas fa-male"></i> Ama
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Father
        </span>
      </h3>
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandFatherLastName" name="confirmandFatherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandFatherFirstName" name="confirmandFatherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandFatherMiddleName" name="confirmandFatherMiddleName">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Pre-Pentecost Seminar Card ng Ama
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Father's Pre-Pentecost Seminar Card
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="confirmandFatherPrePentecostCard" name="confirmandFatherPrePentecostCard" accept="image/*,.pdf">
              </div>
          </div>
      </div>

      <!-- Mother Information -->
      <h3>
        <i class="fas fa-female"></i> Ina
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Mother
        </span>
      </h3>
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandMotherLastName" name="confirmandMotherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandMotherFirstName" name="confirmandMotherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="confirmandMotherMiddleName" name="confirmandMotherMiddleName">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Pre-Pentecost Seminar Card ng Ina
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Mother's Pre-Pentecost Seminar Card
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="confirmandMotherPrePentecostCard" name="confirmandMotherPrePentecostCard" accept="image/*,.pdf">
              </div>
          </div>
      </div>

      <!-- Sponsors Section -->
      <h3>
        <i class="fas fa-users"></i> Mga Sponsor
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Sponsors
        </span>
      </h3>
      <div class="godparents-info">
          <i class="fas fa-info-circle"></i> Hanggang 2 sponsor lamang ang pinapayagan.
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            Only up to 2 sponsors are allowed.
          </span>
      </div>

      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-check"></i> Mga Sponsor
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Sponsors
            </span>
          </h4>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addSponsorBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Sponsor
              </button>
          </div>
          <div id="sponsorContainer"></div>
      </div>

      <!-- Parish Permit -->
      <h3>
        <i class="fas fa-file-alt"></i> Permit sa Parokya
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Parish Permit
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Permit mula sa parokyang kinabibilangan kung hindi taga Barangay Tambo, Sico, at San Salvador
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Permit from your parish if not from Barangay Tambo, Sico, and San Salvador
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="confirmationParishPermit" name="confirmationParishPermit" accept="image/*,.pdf">
              </div>
          </div>
      </div>
    `,

    COMMUNION: `
      <!-- Preferred Schedule -->
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredCommunionDate" name="preferredCommunionDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredCommunionTime" name="preferredCommunionTime" required>
                      <option value="" disabled selected>PUMILI NG ORAS</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Child Information -->
      <h3>
        <i class="fas fa-child"></i> Pangalan ng Makakakomunyon
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Name of Communicant
        </span>
      </h3>
      <div class="uppercase-info">
          <i class="fas fa-info-circle"></i> Lahat ng teksto ay magiging MALAKING TITIK
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            All text will be in UPPERCASE
          </span>
      </div>
      
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionChildLastName" name="communionChildLastName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionChildFirstName" name="communionChildFirstName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionChildMiddleName" name="communionChildMiddleName">
              </div>
          </div>
      </div>

      <!-- Gender -->
      <div class="form-row">
          <div class="form-group">
              <label>
                Kasarian <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender
                </span>
              </label>
              <div class="select-field">
                  <select id="communionChildGender" name="communionChildGender" required>
                      <option value="" disabled selected>PUMILI NG KASARIAN</option>
                      <option value="LALAKI">LALAKI</option>
                      <option value="BABAE">BABAE</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Place and Date of Birth -->
      <h3>
        <i class="fas fa-map-marker-alt"></i> Lugar ng Kapanganakan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Place of Birth
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Probinsya <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Province
                </span>
              </label>
              <div class="select-field">
                  <select id="communionChildBirthProvince" name="communionChildBirthProvince" required onchange="updateCities('communionChildBirth')">
                      <option value="" disabled selected>PUMILI NG PROBINSYA</option>
                      ${Object.keys(philippinesData)
                        .map((province) => `<option value="${province}">${province}</option>`)
                        .join("")}
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Lungsod/Bayan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  City/Municipality
                </span>
              </label>
              <div class="select-field">
                  <select id="communionChildBirthCity" name="communionChildBirthCity" required disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PROBINSYA</option>
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Petsa ng Kapanganakan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Birth
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="communionChildBirthDate" name="communionChildBirthDate" required onchange="calculateAge('communionChild')">
              </div>
          </div>
      </div>

      <!-- Baptized At -->
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Bininyagan Sa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Baptized At
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionBaptizedAt" name="communionBaptizedAt" required placeholder="Pangalan ng simbahan kung saan bininyagan">
              </div>
          </div>
      </div>

      <!-- Age (Auto-calculated) -->
      <div class="form-row">
          <div class="form-group">
              <label>
                Edad <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Age
                </span>
              </label>
              <div class="input-field">
                  <input type="number" id="communionChildAge" name="communionChildAge" min="7" required readonly placeholder="Awtomatikong makakalkula mula sa petsa ng kapanganakan">
              </div>
              <small class="age-info">
                Edad ay awtomatikong makakalkula kapag nalagay na ang petsa ng kapanganakan. Dapat 7 taon pataas.
                <br>
                <span style="font-style: italic; font-size: 0.92em; color: #888;">
                  Age will be automatically calculated when birth date is entered. Must be 7 years old and above.
                </span>
              </small>
          </div>
      </div>

      <!-- Certificate Upload -->
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                I-upload ang Baptismal Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Baptismal Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="communionBaptismalCert" name="communionBaptismalCert" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <!-- Father Information -->
      <h3>
        <i class="fas fa-male"></i> Ama
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Father
        </span>
      </h3>
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionFatherLastName" name="communionFatherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionFatherFirstName" name="communionFatherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionFatherMiddleName" name="communionFatherMiddleName">
              </div>
          </div>
      </div>

      <!-- Mother Information -->
      <h3>
        <i class="fas fa-female"></i> Ina
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Mother
        </span>
      </h3>
      <div class="info-text">
        <i class="fas fa-info-circle"></i> Sundin ang nasa birth certificate.
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Follow what's on the birth certificate.
        </span>
      </div>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionMotherLastName" name="communionMotherLastName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionMotherFirstName" name="communionMotherFirstName">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="communionMotherMiddleName" name="communionMotherMiddleName">
              </div>
          </div>
      </div>

      <!-- Parish Permit -->
      <h3>
        <i class="fas fa-file-alt"></i> Permit sa Parokya
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Parish Permit
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Permit mula sa parokyang kinabibilangan kung hindi taga Barangay Tambo, Sico, at San Salvador
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Permit from your parish if not from Barangay Tambo, Sico, and San Salvador
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="communionParishPermit" name="communionParishPermit" accept="image/*,.pdf">
              </div>
          </div>
      </div>
    `,

    INTENTION: `
      <!-- Preferred Schedule -->
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredIntentionDate" name="preferredIntentionDate" required onchange="updateAvailableTimes()">
              </div>
              <small class="date-info">
                Maaari lamang pumili ng petsa na mas malayo sa ngayon.
                <br>
                <span style="font-style: italic; font-size: 0.92em; color: #888;">
                  May only choose dates that are further from today.
                </span>
              </small>
          </div>
          
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredIntentionTime" name="preferredIntentionTime" required disabled>
                      <option value="" disabled selected>PUMILI MUNA NG PETSA</option>
                  </select>
              </div>
              <small class="time-info">
                  Lunes-Sabado: 5:30 AM, 7:00 AM, 5:00 PM<br>
                  Linggo: 5:30 AM, 9:00 AM, 3:30 PM, 5:00 PM, 7:00 PM
                  <br>
                  <span style="font-style: italic; font-size: 0.92em; color: #888;">
                    Monday-Saturday: 5:30 AM, 7:00 AM, 5:00 PM<br>
                    Sunday: 5:30 AM, 9:00 AM, 3:30 PM, 5:00 PM, 7:00 PM
                  </span>
              </small>
          </div>
      </div>

      <!-- Intention Type -->
      <h3>
        <i class="fas fa-pray"></i> Uri ng Intensyon
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Type of Intention
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Uri ng Intensyon <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Type of Intention
                </span>
              </label>
              <div class="select-field">
                  <select id="intentionType" name="intentionType" required onchange="updateNameFields()">
                      <option value="" disabled selected>PUMILI NG URI NG INTENSYON</option>
                      <option value="PASASALAMAT">PASASALAMAT</option>
                      <option value="KAARAWAN">KAARAWAN</option>
                      <option value="KAHILINGAN">KAHILINGAN</option>
                      <option value="ANIBERSARYO_NG_KASAL">ANIBERSARYO NG KASAL</option>
                      <option value="KALULUWA">KALULUWA</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Names Section -->
      <h3>
        <i class="fas fa-users"></i> Mga Pangalan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Names
        </span>
      </h3>
      <div id="nameFieldsContainer">
          <div class="name-limits-info">
              <i class="fas fa-info-circle"></i> 
              <span id="nameLimitsText">
                Pumili muna ng uri ng intensyon upang makita ang limitasyon sa bilang ng pangalan.
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Choose intention type first to see name limitations.
                </span>
              </span>
          </div>
      </div>

      <!-- Special Message -->
      <h3>
        <i class="fas fa-message"></i> Espesyal na Mensahe
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Special Message
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Espesyal na Mensahe (Opsyonal)
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Special Message (Optional)
                </span>
              </label>
              <div class="input-field">
                  <textarea id="intentionMessage" name="intentionMessage" placeholder="Maaaring maglagay ng espesyal na mensahe para sa intensyon"></textarea>
              </div>
          </div>
      </div>

      <!-- Contact Information -->
      <h3>
        <i class="fas fa-address-book"></i> Impormasyon sa Pakikipag-ugnayan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Contact Information
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Pangalan ng Nag-request <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Requester's Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="requesterName" name="requesterName" required placeholder="Kumpleto na pangalan">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Cellphone No. <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Cellphone Number
                </span>
              </label>
              <div class="input-field">
                  <input type="tel" id="requesterCellphone" name="requesterCellphone" required placeholder="09XXXXXXXXX">
              </div>
          </div>
      </div>
    `,

    WEDDING: `
      <!-- Preferred Schedule -->
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredWeddingDate" name="preferredWeddingDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredWeddingTime" name="preferredWeddingTime" required>
                      <option value="" disabled selected>PUMILI NG ORAS</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="14:00">2:00 PM</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Groom Information -->
      <h3>
        <i class="fas fa-male"></i> Pangalan ng Lalaki
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Groom's Name
        </span>
      </h3>
      <div class="uppercase-info">
          <i class="fas fa-info-circle"></i> Lahat ng teksto ay magiging MALAKING TITIK
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            All text will be in UPPERCASE
          </span>
      </div>
      
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="groomLastName" name="groomLastName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="groomFirstName" name="groomFirstName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="groomMiddleName" name="groomMiddleName">
              </div>
          </div>
      </div>

      <!-- Groom Documents -->
      <h4>
        <i class="fas fa-file-upload"></i> Mga Dokumento ng Lalaki
        <br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          Groom's Documents
        </span>
      </h4>
      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang Baptismal Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Baptismal Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="groomBaptismalCert" name="groomBaptismalCert" accept="image/*,.pdf" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                I-upload ang Kumpil Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Confirmation Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="groomConfirmationCert" name="groomConfirmationCert" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang CENOMAR (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload CENOMAR (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="groomCenomar" name="groomCenomar" accept="image/*,.pdf" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                I-upload ang Marriage License (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Marriage License (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="groomMarriageLicense" name="groomMarriageLicense" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang 2x2 Picture <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload 2x2 Picture
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="groomPicture" name="groomPicture" accept="image/*" required>
              </div>
          </div>
      </div>

      <!-- Bride Information -->
      <h3>
        <i class="fas fa-female"></i> Pangalan ng Babae
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Bride's Name
        </span>
      </h3>
      
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="brideLastName" name="brideLastName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="brideFirstName" name="brideFirstName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="brideMiddleName" name="brideMiddleName">
              </div>
          </div>
      </div>

      <!-- Bride Documents -->
      <h4>
        <i class="fas fa-file-upload"></i> Mga Dokumento ng Babae
        <br>
        <span style="font-style: italic; font-size: 0.92em; color: #888;">
          Bride's Documents
        </span>
      </h4>
      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang Baptismal Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Baptismal Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="brideBaptismalCert" name="brideBaptismalCert" accept="image/*,.pdf" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                I-upload ang Kumpil Certificate (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Confirmation Certificate (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="brideConfirmationCert" name="brideConfirmationCert" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang CENOMAR (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload CENOMAR (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="brideCenomar" name="brideCenomar" accept="image/*,.pdf" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                I-upload ang Marriage License (photocopy ay pwede) <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload Marriage License (photocopy allowed)
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="brideMarriageLicense" name="brideMarriageLicense" accept="image/*,.pdf" required>
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                I-upload ang 2x2 Picture <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Upload 2x2 Picture
                </span>
              </label>
              <div class="input-field">
                  <input type="file" id="bridePicture" name="bridePicture" accept="image/*" required>
              </div>
          </div>
      </div>

      <!-- Wedding Sponsors Section -->
      <h3>
        <i class="fas fa-users"></i> Mga Ninong at Ninang
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Wedding Sponsors
        </span>
      </h3>
      <div class="godparents-info">
          <i class="fas fa-info-circle"></i> Maaaring magdagdag ng hanggang 5 ninong at 5 ninang
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            May add up to 5 godfathers and 5 godmothers
          </span>
      </div>

      <!-- Wedding Ninong Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-tie"></i> Mga Ninong
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Godfathers
            </span>
          </h4>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addWeddingNinongBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Ninong
              </button>
          </div>
          <div id="weddingNinongContainer"></div>
      </div>

      <!-- Wedding Ninang Section -->
      <div class="godparent-section">
          <h4>
            <i class="fas fa-user-friends"></i> Mga Ninang
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Godmothers
            </span>
          </h4>
          <div class="godparent-controls">
              <button type="button" class="btn add-godparent-btn" id="addWeddingNinangBtn">
                  <i class="fas fa-plus"></i> Magdagdag ng Ninang
              </button>
          </div>
          <div id="weddingNinangContainer"></div>
      </div>
    `,

    FUNERAL: `
      <!-- Service Type Selection -->
      <h3>
        <i class="fas fa-cross"></i> Uri ng Serbisyo sa Libing
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Type of Funeral Service
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Pumili ng Uri ng Serbisyo <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Choose Service Type
                </span>
              </label>
              <div class="select-field">
                  <select id="funeralServiceType" name="funeralServiceType" required>
                      <option value="" disabled selected>PUMILI NG URI</option>
                      <option value="MASS">MISA</option>
                      <option value="BLESSING">BLESSING</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Preferred Schedule -->
      <h3>
        <i class="fas fa-calendar-alt"></i> Nais na Petsa at Oras
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Preferred Date and Time
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Nais na Petsa <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Date
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="preferredFuneralDate" name="preferredFuneralDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Nais na Oras <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Preferred Time
                </span>
              </label>
              <div class="select-field">
                  <select id="preferredFuneralTime" name="preferredFuneralTime" required>
                      <option value="" disabled selected>PUMILI NG ORAS</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="13:00">1:00 PM</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Deceased Information -->
      <h3>
        <i class="fas fa-user"></i> Pangalan ng Patay
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Name of the Deceased
        </span>
      </h3>
      <div class="uppercase-info">
          <i class="fas fa-info-circle"></i> Lahat ng teksto ay magiging MALAKING TITIK
          <br>
          <span style="font-style: italic; font-size: 0.95em; color: #555;">
            All text will be in UPPERCASE
          </span>
      </div>
      
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="deceasedLastName" name="deceasedLastName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="deceasedFirstName" name="deceasedFirstName" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="deceasedMiddleName" name="deceasedMiddleName">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Palayaw ng Patay
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Nickname of the Deceased
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="deceasedNickname" name="deceasedNickname">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Tirahan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Address
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="deceasedAddress" name="deceasedAddress">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Petsa ng Kapanganakan <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Birth
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="deceasedBirthDate" name="deceasedBirthDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Bilang ng Anak
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Number of Children
                </span>
              </label>
              <div class="input-field">
                  <input type="number" id="numberOfChildren" name="numberOfChildren" min="0">
              </div>
          </div>
      </div>

      <!-- Marital Status -->
      <h3>
        <i class="fas fa-heart"></i> Estado sa Buhay
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Marital Status
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Estado sa Buhay <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Marital Status
                </span>
              </label>
              <div class="select-field">
                  <select id="deceasedMaritalStatus" name="deceasedMaritalStatus" required onchange="toggleSpouseFields()">
                      <option value="" disabled selected>PUMILI NG ESTADO</option>
                      <option value="MAY_ASAWA">May Asawa</option>
                      <option value="BINATA_DALAGA">Binata/Dalaga</option>
                      <option value="BALO">Balo</option>
                      <option value="HIWALAY">Hiwalay</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Spouse Information (conditional) -->
      <div id="spouseSection" style="display: none;">
          <h4>
            <i class="fas fa-ring"></i> Impormasyon ng Asawa
            <br>
            <span style="font-style: italic; font-size: 0.92em; color: #888;">
              Spouse Information
            </span>
          </h4>
          
          <div class="form-row">
              <div class="form-group">
                  <label>
                    Kasal Sa
                    <br>
                    <span style="font-style: italic; font-size: 0.95em; color: #555;">
                      Married At
                    </span>
                  </label>
                  <div class="select-field">
                      <select id="marriageTypeDeceased" name="marriageTypeDeceased">
                          <option value="" disabled selected>PUMILI NG URI</option>
                          <option value="SIMBAHAN">Kasal sa Simbahan</option>
                          <option value="HUWES">Kasal sa Huwes</option>
                      </select>
                  </div>
              </div>
          </div>

          <div class="form-row">
              <div class="form-group">
                  <label>
                    Apelyido ng Asawa
                    <br>
                    <span style="font-style: italic; font-size: 0.95em; color: #555;">
                      Spouse's Last Name
                    </span>
                  </label>
                  <div class="input-field">
                      <input type="text" id="spouseLastName" name="spouseLastName">
                  </div>
              </div>
              
              <div class="form-group">
                  <label>
                    Unang Pangalan ng Asawa
                    <br>
                    <span style="font-style: italic; font-size: 0.95em; color: #555;">
                      Spouse's First Name
                    </span>
                  </label>
                  <div class="input-field">
                      <input type="text" id="spouseFirstName" name="spouseFirstName">
                  </div>
              </div>
              
              <div class="form-group">
                  <label>
                    Gitnang Pangalan ng Asawa
                    <br>
                    <span style="font-style: italic; font-size: 0.95em; color: #555;">
                      Spouse's Middle Name
                    </span>
                  </label>
                  <div class="input-field">
                      <input type="text" id="spouseMiddleName" name="spouseMiddleName">
                  </div>
              </div>
          </div>

          <div class="form-row">
              <div class="form-group">
                  <label>
                    Palayaw ng Asawa
                    <br>
                    <span style="font-style: italic; font-size: 0.95em; color: #555;">
                      Spouse's Nickname
                    </span>
                  </label>
                  <div class="input-field">
                      <input type="text" id="spouseNickname" name="spouseNickname">
                  </div>
              </div>
          </div>
      </div>

      <!-- Death Information -->
      <h3>
        <i class="fas fa-calendar-times"></i> Impormasyon ng Kamatayan
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Death Information
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Kailan Namatay <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Death
                </span>
              </label>
              <div class="input-field">
                  <input type="date" id="deathDate" name="deathDate" required>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Saan Namatay
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Place of Death
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="placeOfDeath" name="placeOfDeath">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group full-width">
              <label>
                Dahilan ng Kamatayan
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Cause of Death
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="causeOfDeath" name="causeOfDeath">
              </div>
          </div>
      </div>

      <!-- Sacrament Questions -->
      <h3>
        <i class="fas fa-cross"></i> Mga Tanong Tungkol sa Sakramento
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Questions About Sacraments
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Bago namatay, napuntahan ba ng pari para sa Sakramento ng Pagpapahatid ng Langis? <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Before death, was the priest visited for the Sacrament of Extreme Unction?
                </span>
              </label>
              <div class="select-field">
                  <select id="lastRites" name="lastRites" required>
                      <option value="" disabled selected>PUMILI NG SAGOT</option>
                      <option value="OO">Oo</option>
                      <option value="HINDI">Hindi</option>
                  </select>
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Napa-kumpisal ba? <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Did they confess?
                </span>
              </label>
              <div class="select-field">
                  <select id="confession" name="confession" required>
                      <option value="" disabled selected>PUMILI NG SAGOT</option>
                      <option value="OO">Oo</option>
                      <option value="HINDI">Hindi</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Parents Information -->
      <h3>
        <i class="fas fa-users"></i> Mga Magulang
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Parents
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido ng Ama
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Father's Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherLastNameDeceased" name="fatherLastNameDeceased">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan ng Ama
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Father's First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherFirstNameDeceased" name="fatherFirstNameDeceased">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan ng Ama
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Father's Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="fatherMiddleNameDeceased" name="fatherMiddleNameDeceased">
              </div>
          </div>
      </div>

      <div class="form-row">
          <div class="form-group">
              <label>
                Apelyido ng Ina
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Mother's Last Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherLastNameDeceased" name="motherLastNameDeceased">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Unang Pangalan ng Ina
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Mother's First Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherFirstNameDeceased" name="motherFirstNameDeceased">
              </div>
          </div>
          
          <div class="form-group">
              <label>
                Gitnang Pangalan ng Ina
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Mother's Middle Name
                </span>
              </label>
              <div class="input-field">
                  <input type="text" id="motherMiddleNameDeceased" name="motherMiddleNameDeceased">
              </div>
          </div>
      </div>

      <!-- Relationship to Deceased -->
      <h3>
        <i class="fas fa-user-friends"></i> Relasyon sa Namatay
        <br>
        <span style="font-style: italic; font-size: 0.95em; color: #555;">
          Relationship to the Deceased
        </span>
      </h3>
      <div class="form-row">
          <div class="form-group">
              <label>
                Relasyon sa Namatay <span class="required">*</span>
                <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Relationship to the Deceased
                </span>
              </label>
              <div class="select-field">
                  <select id="relationshipToDeceased" name="relationshipToDeceased" required>
                      <option value="" disabled selected>PUMILI NG RELASYON</option>
                      <option value="MAGULANG">Magulang</option>
                      <option value="ANAK">Anak</option>
                      <option value="ASAWA">Asawa</option>
                      <option value="KAPATID">Kapatid</option>
                      <option value="LEGAL_GUARDIAN">Legal na Tagapag-alaga</option>
                      <option value="AUTHORIZED_REP">Awtorisadong Kinatawan</option>
                  </select>
              </div>
          </div>
      </div>
    `,
  }

  // Initialize
  init()

  function init() {
    // Add event listeners
    nextBtn?.addEventListener("click", goToSummary)
    editStep1Btn?.addEventListener("click", goBackToScheduleForm)
    confirmStep1Btn?.addEventListener("click", goToAcknowledgement)
    backToStep1ReviewBtn?.addEventListener("click", goBackToStep1Review)
    toPaymentBtn?.addEventListener("click", goToPayment)
    backToAcknowledgementBtn?.addEventListener("click", goBackToAcknowledgement)
    payWithGcashBtn?.addEventListener("click", processGcashPayment)
    verifyPaymentBtn?.addEventListener("click", verifyPayment)
    cancelScheduleBtn?.addEventListener("click", cancelSchedule)
    printReceiptBtn?.addEventListener("click", printReceipt)
    returnDashboardBtn?.addEventListener("click", returnToDashboard)

    // Service selection
    serviceTypeSelect?.addEventListener("change", selectService)

    // Acknowledgement terms
    acknowledgementTerms?.addEventListener("change", function () {
      if (toPaymentBtn) {
        toPaymentBtn.disabled = !this.checked
      }
    })

    // Auto uppercase text inputs
    document.addEventListener("input", (e) => {
      if (e.target && (e.target.type === "text" || e.target.tagName === "TEXTAREA") && e.target.id !== "emailAddress") {
        e.target.value = e.target.value.toUpperCase()
      }
    })

    // Remove error styling on input
    const allInputs = document.querySelectorAll("input, select, textarea")
    allInputs.forEach((input) => {
      input.addEventListener("input", function () {
        this.style.borderColor = "#dee2e6"
      })
    })

    // Real-time validation
    document.addEventListener("input", debounce(validateScheduleForm, 300))
    document.addEventListener("change", validateScheduleForm)
  }

  function selectService(e) {
    selectedService = e.target.value

    // Update step 1 label to include service name
    const step1Label = document.getElementById("step-1-label")
    if (step1Label && selectedService) {
      step1Label.textContent = `Impormasyon ng Serbisyo - ${serviceNames[selectedService]}`
    }

    // Reset counters
    principalNinongCount = 0
    principalNinangCount = 0
    secondaryNinongCount = 0
    secondaryNinangCount = 0
    sponsorCount = 0
    weddingNinongCount = 0
    weddingNinangCount = 0
    intentionNamesCount = 0

    // Load dynamic fields
    if (dynamicServiceFields && selectedService) {
      dynamicServiceFields.innerHTML = serviceFields[selectedService]

      // Setup service-specific functionality
      if (selectedService === "BAPTISM") {
        setupBaptismForm()
      } else if (selectedService === "CONFIRMATION") {
        setupConfirmationForm()
      } else if (selectedService === "COMMUNION") {
        setupCommunionForm()
      } else if (selectedService === "WEDDING") {
        setupWeddingForm()
      } else if (selectedService === "FUNERAL") {
        setupFuneralForm()
      } else if (selectedService === "INTENTION") {
        setupIntentionForm()
      }
    }

    // Enable next button if form is valid
    validateScheduleForm()
  }

  // Setup baptism form functionality
  function setupBaptismForm() {
    setupDateValidation("preferredBaptismDate", "childBirthDate")
    setupPhoneValidation("baptismCellphone")
    setupBaptismSponsorsHandlers()
  }

  // Setup confirmation form functionality
  function setupConfirmationForm() {
    setupDateValidation("preferredConfirmationDate", "confirmandBirthDate")
    setupSponsorHandlers()
    setupAgeCalculation("confirmand", 10)
  }

  // Setup communion form functionality
  function setupCommunionForm() {
    setupDateValidation("preferredCommunionDate", "communionChildBirthDate")
    setupAgeCalculation("communionChild", 7)
  }

  // Setup wedding form functionality
  function setupWeddingForm() {
    setupDateValidation("preferredWeddingDate")
    setupWeddingSponsorsHandlers()
  }

  // Setup funeral form functionality
  function setupFuneralForm() {
    setupDateValidation("preferredFuneralDate", "deceasedBirthDate")
    setupDeathDateValidation()
  }

  // Setup intention form functionality
  function setupIntentionForm() {
    setupIntentionDateValidation()
    setupPhoneValidation("requesterCellphone")
  }

  // Setup baptism sponsors handlers
  function setupBaptismSponsorsHandlers() {
    const addPrincipalNinongBtn = document.getElementById("addPrincipalNinongBtn")
    const addPrincipalNinangBtn = document.getElementById("addPrincipalNinangBtn")
    const addSecondaryNinongBtn = document.getElementById("addSecondaryNinongBtn")
    const addSecondaryNinangBtn = document.getElementById("addSecondaryNinangBtn")

    if (addPrincipalNinongBtn) {
      addPrincipalNinongBtn.addEventListener("click", () => addBaptismSponsor("principalNinong"))
    }
    if (addPrincipalNinangBtn) {
      addPrincipalNinangBtn.addEventListener("click", () => addBaptismSponsor("principalNinang"))
    }
    if (addSecondaryNinongBtn) {
      addSecondaryNinongBtn.addEventListener("click", () => addBaptismSponsor("secondaryNinong"))
    }
    if (addSecondaryNinangBtn) {
      addSecondaryNinangBtn.addEventListener("click", () => addBaptismSponsor("secondaryNinang"))
    }
  }

  // Add baptism sponsor
  function addBaptismSponsor(type) {
    let container, count, btn, maxCount

    if (type === "principalNinong") {
      container = document.getElementById("principalNinongContainer")
      count = principalNinongCount
      btn = document.getElementById("addPrincipalNinongBtn")
      maxCount = maxPrincipalSponsors
    } else if (type === "principalNinang") {
      container = document.getElementById("principalNinangContainer")
      count = principalNinangCount
      btn = document.getElementById("addPrincipalNinangBtn")
      maxCount = maxPrincipalSponsors
    } else if (type === "secondaryNinong") {
      container = document.getElementById("secondaryNinongContainer")
      count = secondaryNinongCount
      btn = document.getElementById("addSecondaryNinongBtn")
      maxCount = maxSecondarySponsors
    } else if (type === "secondaryNinang") {
      container = document.getElementById("secondaryNinangContainer")
      count = secondaryNinangCount
      btn = document.getElementById("addSecondaryNinangBtn")
      maxCount = maxSecondarySponsors
    }

    if (count >= maxCount) {
      alert(`Maaari lamang magdagdag ng hanggang ${maxCount} ${type.includes("ninong") ? "ninong" : "ninang"}`)
      return
    }

    const newCount = count + 1
    const sponsorHtml = createBaptismSponsorHtml(type, newCount)

    container.insertAdjacentHTML("beforeend", sponsorHtml)

    // Update counters
    if (type === "principalNinong") {
      principalNinongCount = newCount
      if (principalNinongCount >= maxCount) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Principal Ninong Added`
      }
    } else if (type === "principalNinang") {
      principalNinangCount = newCount
      if (principalNinangCount >= maxCount) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Principal Ninang Added`
      }
    } else if (type === "secondaryNinong") {
      secondaryNinongCount = newCount
      if (secondaryNinongCount >= maxCount) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Maximum na ${maxCount} ninong`
      }
    } else if (type === "secondaryNinang") {
      secondaryNinangCount = newCount
      if (secondaryNinangCount >= maxCount) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Maximum na ${maxCount} ninang`
      }
    }

    // Setup text transformation for new elements
    setupTextTransformation(`${type}-${newCount}`)
  }

  // Create baptism sponsor HTML
  function createBaptismSponsorHtml(type, count) {
    const isRequired = type.includes("principal")
    const title = type.includes("ninong") ? "Ninong" : "Ninang"
    const prefix = type.includes("principal") ? "Principal" : "Secondary"

    return `
      <div class="godparent-item" id="${type}-${count}">
        <div class="godparent-header">
          <div class="godparent-title">${prefix} ${title} #${count} ${isRequired ? "(Required)" : ""}</div>
          <button type="button" class="remove-godparent-btn" onclick="removeBaptismSponsor('${type}', ${count})">
            <i class="fas fa-times"></i> Alisin
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Apelyido ${isRequired ? '<span class="required">*</span>' : ""}</label>
            <div class="input-field">
              <input type="text" id="${type}LastName${count}" ${isRequired ? "required" : ""}>
            </div>
          </div>
          <div class="form-group">
            <label>Unang Pangalan ${isRequired ? '<span class="required">*</span>' : ""}</label>
            <div class="input-field">
              <input type="text" id="${type}FirstName${count}" ${isRequired ? "required" : ""}>
            </div>
          </div>
          <div class="form-group">
            <label>Gitnang Pangalan</label>
            <div class="input-field">
              <input type="text" id="${type}MiddleName${count}">
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label>Tirahan</label>
            <div class="input-field">
              <textarea id="${type}Address${count}"></textarea>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Estado sa Kasal</label>
            <div class="select-field">
              <select id="${type}MaritalStatus${count}" onchange="toggleBaptismMarriageFields('${type}', ${count})">
                <option value="">Pumili</option>
                <option value="MARRIED">Kasal</option>
                <option value="SINGLE">Hindi Kasal</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="marriage-fields" id="${type}MarriageFields${count}" style="display: none;">
          <div class="form-row">
            <div class="form-group full-width">
              <label>I-upload ang Marriage Contract</label>
              <div class="input-field">
                <input type="file" id="${type}MarriageContract${count}" accept="image/*,.pdf">
              </div>
            </div>
          </div>
        </div>
        
        <div class="single-fields" id="${type}SingleFields${count}" style="display: none;">
          <div class="form-row">
            <div class="form-group full-width">
              <label>I-upload ang Confirmation Certificate</label>
              <div class="input-field">
                <input type="file" id="${type}ConfirmationCert${count}" accept="image/*,.pdf">
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
            <label>I-upload ang Pre-Jordan Seminar Card</label>
            <div class="input-field">
              <input type="file" id="${type}PreJordanCard${count}" accept="image/*,.pdf">
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Remove baptism sponsor
  window.removeBaptismSponsor = (type, count) => {
    const element = document.getElementById(`${type}-${count}`)
    if (element) {
      element.remove()

      if (type === "principalNinong") {
        principalNinongCount--
        const btn = document.getElementById("addPrincipalNinongBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Principal na Ninong'
      } else if (type === "principalNinang") {
        principalNinangCount--
        const btn = document.getElementById("addPrincipalNinangBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Principal na Ninang'
      } else if (type === "secondaryNinong") {
        secondaryNinongCount--
        const btn = document.getElementById("addSecondaryNinongBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Secondary na Ninong'
      } else if (type === "secondaryNinang") {
        secondaryNinangCount--
        const btn = document.getElementById("addSecondaryNinangBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Secondary na Ninang'
      }
    }
  }

  // Toggle marriage fields for baptism sponsors
  window.toggleBaptismMarriageFields = (type, count) => {
    const select = document.getElementById(`${type}MaritalStatus${count}`)
    const marriageFields = document.getElementById(`${type}MarriageFields${count}`)
    const singleFields = document.getElementById(`${type}SingleFields${count}`)

    if (select.value === "MARRIED") {
      marriageFields.style.display = "block"
      singleFields.style.display = "none"
    } else if (select.value === "SINGLE") {
      singleFields.style.display = "block"
      marriageFields.style.display = "none"
    } else {
      marriageFields.style.display = "none"
      singleFields.style.display = "none"
    }
  }

  // Setup age calculation for confirmation and communion
  function setupAgeCalculation(prefix, minAge) {
    const birthDateField = document.getElementById(`${prefix}BirthDate`)
    const ageField = document.getElementById(`${prefix}Age`)

    if (birthDateField && ageField) {
      birthDateField.addEventListener("change", () => {
        calculateAge(prefix)
      })
    }
  }

  // Calculate age function
  window.calculateAge = (prefix) => {
    const birthDateField = document.getElementById(`${prefix}BirthDate`)
    const ageField = document.getElementById(`${prefix}Age`)

    if (!birthDateField || !ageField || !birthDateField.value) return

    const birthDate = new Date(birthDateField.value)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    ageField.value = age

    // Validate age based on service type
    let minAge = 0
    let serviceName = ""

    if (prefix === "confirmand") {
      minAge = 10
      serviceName = "kumpil"
    } else if (prefix === "communionChild") {
      minAge = 7
      serviceName = "unang komunyon"
    }

    if (age < minAge) {
      showError(ageField, `Ang edad ay dapat ${minAge} taon pataas para sa ${serviceName}`)
      ageField.value = ""
    } else {
      clearError(ageField)
    }
  }

  // Setup intention date validation with time restrictions
  function setupIntentionDateValidation() {
    const dateField = document.getElementById("preferredIntentionDate")
    const timeField = document.getElementById("preferredIntentionTime")

    if (dateField) {
      // Set minimum date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateField.min = tomorrow.toISOString().split("T")[0]

      dateField.addEventListener("change", () => {
        updateAvailableTimes()
      })
    }
  }

  // Update available times based on selected date
  window.updateAvailableTimes = () => {
    const dateField = document.getElementById("preferredIntentionDate")
    const timeField = document.getElementById("preferredIntentionTime")

    if (!dateField || !timeField || !dateField.value) return

    const selectedDate = new Date(dateField.value)
    const dayOfWeek = selectedDate.getDay() // 0 = Sunday, 1 = Monday, etc.

    // Clear existing options
    timeField.innerHTML = '<option value="" disabled selected>PUMILI NG ORAS</option>'

    let availableTimes = []

    if (dayOfWeek === 0) {
      // Sunday
      availableTimes = [
        { value: "05:30", text: "5:30 AM" },
        { value: "09:00", text: "9:00 AM" },
        { value: "15:30", text: "3:30 PM" },
        { value: "17:00", text: "5:00 PM" },
        { value: "19:00", text: "7:00 PM" },
      ]
    } else {
      // Monday to Saturday
      availableTimes = [
        { value: "05:30", text: "5:30 AM" },
        { value: "07:00", text: "7:00 AM" },
        { value: "17:00", text: "5:00 PM" },
      ]
    }

    // Add available times to select
    availableTimes.forEach((time) => {
      const option = document.createElement("option")
      option.value = time.value
      option.textContent = time.text
      timeField.appendChild(option)
    })

    timeField.disabled = false
  }

  // Update name fields based on intention type
  window.updateNameFields = () => {
    const intentionTypeField = document.getElementById("intentionType")
    const nameFieldsContainer = document.getElementById("nameFieldsContainer")
    const nameLimitsText = document.getElementById("nameLimitsText")

    if (!intentionTypeField || !nameFieldsContainer) return

    const intentionType = intentionTypeField.value
    let maxNames = 0
    let fieldLabel = ""
    let limitText = ""

    // Clear existing name fields
    const existingNameFields = nameFieldsContainer.querySelectorAll(".name-field-row")
    existingNameFields.forEach((field) => field.remove())

    switch (intentionType) {
      case "PASASALAMAT":
      case "KAARAWAN":
      case "KAHILINGAN":
        maxNames = 1
        fieldLabel = "Pangalan"
        limitText = "Isang pangalan lamang ang pinapayagan para sa ganitong uri ng intensyon."
        break
      case "ANIBERSARYO_NG_KASAL":
        maxNames = 2
        fieldLabel = "Pangalan ng Mag-asawa"
        limitText = "Dalawang pangalan lamang ang pinapayagan para sa anibersaryo ng kasal."
        break
      case "KALULUWA":
        maxNames = 2
        fieldLabel = "Pangalan ng Yumao"
        limitText = "Dalawang pangalan lamang ang pinapayagan para sa kapakanan ng kaluluwa."
        break
      default:
        nameLimitsText.textContent =
          "Pumili muna ng uri ng intensyon upang makita ang limitasyon sa bilang ng pangalan."
        return
    }

    // Update limits text
    nameLimitsText.textContent = limitText

    // Create name input fields
    for (let i = 1; i <= maxNames; i++) {
      const nameFieldRow = document.createElement("div")
      nameFieldRow.className = "form-row name-field-row"

      const nameFieldHtml = `
        <div class="form-group full-width">
          <label>${fieldLabel} ${maxNames > 1 ? `#${i}` : ""} <span class="required">*</span></label>
          <div class="input-field">
            <input type="text" id="intentionName${i}" name="intentionName${i}" required placeholder="Kumpleto na pangalan">
          </div>
        </div>
      `

      nameFieldRow.innerHTML = nameFieldHtml
      nameFieldsContainer.appendChild(nameFieldRow)
    }

    intentionNamesCount = maxNames
  }

  // Setup date validation
  function setupDateValidation(preferredDateId, birthDateId) {
    const preferredDate = document.getElementById(preferredDateId)
    const birthDate = document.getElementById(birthDateId)

    if (preferredDate) {
      // Fix calendar date issue by adding one day to current date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      preferredDate.min = tomorrow.toISOString().split("T")[0]

      preferredDate.addEventListener("change", function () {
        const selectedDate = new Date(this.value)
        const dayOfWeek = selectedDate.getDay()

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          showError(this, "Ang serbisyo ay ginagawa lamang tuwing weekdays (Lunes hanggang Biyernes)")
          this.value = ""
        } else {
          clearError(this)
        }
      })
    }

    if (birthDate) {
      const today = new Date()
      birthDate.max = today.toISOString().split("T")[0]

      birthDate.addEventListener("change", function () {
        const selectedDate = new Date(this.value)
        const age = Math.floor((today - selectedDate) / (365.25 * 24 * 60 * 60 * 1000))

        if (selectedService === "BAPTISM" && age > 18) {
          showError(this, "Ang binyag ay para sa mga batang 18 taon pababa")
          this.value = ""
        } else if (selectedService === "CONFIRMATION" && age < 10) {
          showError(this, "Ang kumpil ay para sa mga 10 taon pataas")
          this.value = ""
        } else if (selectedService === "COMMUNION" && age < 7) {
          showError(this, "Ang unang komunyon ay para sa mga 7 taon pataas")
          this.value = ""
        } else {
          clearError(this)
        }
      })
    }
  }

  // Setup death date validation
  function setupDeathDateValidation() {
    const deathDate = document.getElementById("deathDate")
    const birthDate = document.getElementById("deceasedBirthDate")

    if (deathDate) {
      const today = new Date()
      deathDate.max = today.toISOString().split("T")[0]

      deathDate.addEventListener("change", function () {
        if (birthDate && birthDate.value) {
          const birth = new Date(birthDate.value)
          const death = new Date(this.value)

          if (death <= birth) {
            showError(this, "Ang petsa ng kamatayan ay dapat mas bago sa petsa ng kapanganakan")
            this.value = ""
          } else {
            clearError(this)
          }
        }
      })
    }

    if (birthDate) {
      const today = new Date()
      birthDate.max = today.toISOString().split("T")[0]

      birthDate.addEventListener("change", function () {
        if (deathDate && deathDate.value) {
          const birth = new Date(this.value)
          const death = new Date(deathDate.value)

          if (death <= birth) {
            showError(deathDate, "Ang petsa ng kamatayan ay dapat mas bago sa petsa ng kapanganakan")
            deathDate.value = ""
          } else {
            clearError(deathDate)
          }
        }
      })
    }
  }

  // Setup phone validation
  function setupPhoneValidation(phoneFieldId) {
    const phoneField = document.getElementById(phoneFieldId)
    if (phoneField) {
      phoneField.addEventListener("input", function () {
        let value = this.value.replace(/\D/g, "")
        if (value.length > 11) {
          value = value.substring(0, 11)
        }
        this.value = value

        if (value.length === 11 && value.startsWith("09")) {
          clearError(this)
        } else if (value.length > 0) {
          showError(this, "Ang cellphone number ay dapat nagsisimula sa 09 at may 11 digits")
        }
      })
    }
  }

  // Update cities based on selected province
  window.updateCities = (prefix) => {
    const provinceSelect =
      document.getElementById(`${prefix}Province`) || document.getElementById(`${prefix}BirthProvince`)
    const citySelect = document.getElementById(`${prefix}City`) || document.getElementById(`${prefix}BirthCity`)

    if (!provinceSelect || !citySelect) return

    const selectedProvince = provinceSelect.value

    // Clear city options
    citySelect.innerHTML = '<option value="" disabled selected>PUMILI NG LUNGSOD/BAYAN</option>'

    if (selectedProvince && philippinesData[selectedProvince]) {
      citySelect.disabled = false
      philippinesData[selectedProvince].forEach((city) => {
        const option = document.createElement("option")
        option.value = city
        option.textContent = city
        citySelect.appendChild(option)
      })
    } else {
      citySelect.disabled = true
      citySelect.innerHTML = '<option value="" disabled selected>PUMILI MUNA NG PROBINSYA</option>'
    }
  }

  // Setup sponsor handlers for confirmation
  function setupSponsorHandlers() {
    const addSponsorBtn = document.getElementById("addSponsorBtn")

    if (addSponsorBtn) {
      addSponsorBtn.addEventListener("click", () => addSponsor())
    }
  }

  // Add sponsor for confirmation
  function addSponsor() {
    const container = document.getElementById("sponsorContainer")
    const btn = document.getElementById("addSponsorBtn")

    if (sponsorCount >= maxConfirmationSponsors) {
      alert(`Maaari lamang magdagdag ng hanggang ${maxConfirmationSponsors} sponsor`)
      return
    }

    const newCount = sponsorCount + 1
    const sponsorHtml = createSponsorHtml(newCount)

    container.insertAdjacentHTML("beforeend", sponsorHtml)

    sponsorCount = newCount
    if (sponsorCount >= maxConfirmationSponsors) {
      btn.disabled = true
      btn.innerHTML = `<i class="fas fa-check"></i> Maximum na ${maxConfirmationSponsors} sponsor`
    }

    // Setup text transformation for new elements
    setupTextTransformation(`sponsor-${newCount}`)
  }

  // Create sponsor HTML for confirmation
  function createSponsorHtml(count) {
    return `
      <div class="godparent-item" id="sponsor-${count}">
        <div class="godparent-header">
          <div class="godparent-title">Sponsor #${count}</div>
          <button type="button" class="remove-godparent-btn" onclick="removeSponsor(${count})">
            <i class="fas fa-times"></i> Alisin
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Apelyido</label>
            <div class="input-field">
              <input type="text" id="sponsorLastName${count}">
            </div>
          </div>
          <div class="form-group">
            <label>Unang Pangalan</label>
            <div class="input-field">
              <input type="text" id="sponsorFirstName${count}">
            </div>
          </div>
          <div class="form-group">
            <label>Gitnang Pangalan</label>
            <div class="input-field">
              <input type="text" id="sponsorMiddleName${count}">
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Estado sa Kasal</label>
            <div class="select-field">
              <select id="sponsorMaritalStatus${count}" onchange="toggleSponsorMarriageFields(${count})">
                <option value="">Pumili</option>
                <option value="MARRIED">Kasal</option>
                <option value="SINGLE">Hindi Kasal</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="marriage-fields" id="sponsorMarriageFields${count}" style="display: none;">
          <div class="form-row">
            <div class="form-group full-width">
              <label>I-upload ang Marriage Contract</label>
              <div class="input-field">
                <input type="file" id="sponsorMarriageContract${count}" accept="image/*,.pdf">
              </div>
            </div>
          </div>
        </div>
        
        <div class="single-fields" id="sponsorSingleFields${count}" style="display: none;">
          <div class="form-row">
            <div class="form-group full-width">
              <label>I-upload ang Confirmation Certificate</label>
              <div class="input-field">
                <input type="file" id="sponsorConfirmationCert${count}" accept="image/*,.pdf">
              </div>
            </div>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group full-width">
              <label>I-upload ang Pre-Pentecost Seminar Card</label>
              <div class="input-field">
                  <input type="file" id="sponsorPrePentecostCard${count}" accept="image/*,.pdf">
              </div>
          </div>
        </div>
      </div>
    `
  }

  // Remove sponsor
  window.removeSponsor = (count) => {
    const element = document.getElementById(`sponsor-${count}`)
    if (element) {
      element.remove()
      sponsorCount--
      const btn = document.getElementById("addSponsorBtn")
      btn.disabled = false
      btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Sponsor'
    }
  }

  // Setup wedding sponsors handlers
  function setupWeddingSponsorsHandlers() {
    const addWeddingNinongBtn = document.getElementById("addWeddingNinongBtn")
    const addWeddingNinangBtn = document.getElementById("addWeddingNinangBtn")

    if (addWeddingNinongBtn) {
      addWeddingNinongBtn.addEventListener("click", () => addWeddingSponsor("ninong"))
    }

    if (addWeddingNinangBtn) {
      addWeddingNinangBtn.addEventListener("click", () => addWeddingSponsor("ninang"))
    }
  }

  // Add wedding sponsor
  function addWeddingSponsor(type) {
    const container = document.getElementById(`wedding${type.charAt(0).toUpperCase() + type.slice(1)}Container`)
    const count = type === "ninong" ? weddingNinongCount : weddingNinangCount
    const btn = document.getElementById(`addWedding${type.charAt(0).toUpperCase() + type.slice(1)}Btn`)

    if (count >= maxWeddingSponsors) {
      alert(`Maaari lamang magdagdag ng hanggang ${maxWeddingSponsors} ${type}`)
      return
    }

    const newCount = count + 1
    const sponsorHtml = createWeddingSponsorHtml(type, newCount)

    container.insertAdjacentHTML("beforeend", sponsorHtml)

    if (type === "ninong") {
      weddingNinongCount = newCount
      if (weddingNinongCount >= maxWeddingSponsors) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Maximum na ${maxWeddingSponsors} ninong`
      }
    } else {
      weddingNinangCount = newCount
      if (weddingNinangCount >= maxWeddingSponsors) {
        btn.disabled = true
        btn.innerHTML = `<i class="fas fa-check"></i> Maximum na ${maxWeddingSponsors} ninang`
      }
    }

    // Setup text transformation for new elements
    setupTextTransformation(`wedding-${type}-${newCount}`)
  }

  // Create wedding sponsor HTML
  function createWeddingSponsorHtml(type, count) {
    const title = type === "ninong" ? "Ninong" : "Ninang"
    return `
      <div class="godparent-item" id="wedding-${type}-${count}">
        <div class="godparent-header">
          <div class="godparent-title">${title} #${count}</div>
          <button type="button" class="remove-godparent-btn" onclick="removeWeddingSponsor('${type}', ${count})">
            <i class="fas fa-times"></i> Alisin
          </button>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Apelyido</label>
            <div class="input-field">
              <input type="text" id="wedding${type.charAt(0).toUpperCase() + type.slice(1)}LastName${count}">
            </div>
          </div>
          <div class="form-group">
            <label>Unang Pangalan</label>
            <div class="input-field">
              <input type="text" id="wedding${type.charAt(0).toUpperCase() + type.slice(1)}FirstName${count}">
            </div>
          </div>
          <div class="form-group">
            <label>Gitnang Pangalan</label>
            <div class="input-field">
              <input type="text" id="wedding${type.charAt(0).toUpperCase() + type.slice(1)}MiddleName${count}">
            </div>
          </div>
        </div>
      </div>
    `
  }

  // Remove wedding sponsor
  window.removeWeddingSponsor = (type, count) => {
    const element = document.getElementById(`wedding-${type}-${count}`)
    if (element) {
      element.remove()

      if (type === "ninong") {
        weddingNinongCount--
        const btn = document.getElementById("addWeddingNinongBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Ninong'
      } else {
        weddingNinangCount--
        const btn = document.getElementById("addWeddingNinangBtn")
        btn.disabled = false
        btn.innerHTML = '<i class="fas fa-plus"></i> Magdagdag ng Ninang'
      }
    }
  }

  // Toggle marriage fields for sponsors
  window.toggleSponsorMarriageFields = (count) => {
    const select = document.getElementById(`sponsorMaritalStatus${count}`)
    const marriageFields = document.getElementById(`sponsorMarriageFields${count}`)
    const singleFields = document.getElementById(`sponsorSingleFields${count}`)

    if (select.value === "MARRIED") {
      marriageFields.style.display = "block"
      singleFields.style.display = "none"
    } else if (select.value === "SINGLE") {
      singleFields.style.display = "block"
      marriageFields.style.display = "none"
    } else {
      marriageFields.style.display = "none"
      singleFields.style.display = "none"
    }
  }

  // Toggle spouse fields for funeral
  window.toggleSpouseFields = () => {
    const maritalStatus = document.getElementById("deceasedMaritalStatus")
    const spouseSection = document.getElementById("spouseSection")

    if (maritalStatus.value === "MAY_ASAWA") {
      spouseSection.style.display = "block"
    } else {
      spouseSection.style.display = "none"
      // Clear spouse fields when hidden
      const spouseFields = spouseSection.querySelectorAll("input, select")
      spouseFields.forEach((field) => (field.value = ""))
    }
  }

  // Setup text transformation for new elements
  function setupTextTransformation(containerId) {
    const container = document.getElementById(containerId)
    if (container) {
      const textInputs = container.querySelectorAll('input[type="text"], textarea')
      textInputs.forEach((input) => {
        input.addEventListener("input", function () {
          this.value = this.value.toUpperCase()
        })
      })
    }
  }

  // Show error
  function showError(field, message) {
    const container = field.closest(".input-field") || field.closest(".select-field")
    let errorElement = container.querySelector(".error-message")

    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "error-message"
      errorElement.style.color = "#e74c3c"
      errorElement.style.fontSize = "12px"
      errorElement.style.marginTop = "5px"
      container.appendChild(errorElement)
    }

    errorElement.textContent = message
    errorElement.style.display = "block"
    field.style.borderColor = "#e74c3c"
  }

  // Clear error
  function clearError(field) {
    const container = field.closest(".input-field") || field.closest(".select-field")
    const errorElement = container.querySelector(".error-message")

    if (errorElement) {
      errorElement.style.display = "none"
    }

    field.style.borderColor = "#dee2e6"
  }

  function validateScheduleForm() {
    if (!selectedService) {
      if (nextBtn) nextBtn.disabled = true
      return false
    }

    const requiredFields = scheduleFormSection?.querySelectorAll("input[required], select[required]") || []
    let isValid = true

    // Check for required principal sponsors in baptism
    if (selectedService === "BAPTISM") {
      if (principalNinongCount === 0) {
        isValid = false
        showNotification("Kailangan ng 1 Principal na Ninong", "error")
      }
      if (principalNinangCount === 0) {
        isValid = false
        showNotification("Kailangan ng 1 Principal na Ninang", "error")
      }
    }

    requiredFields.forEach((field) => {
      if (field.type === "file") {
        if (field.files.length === 0) {
          field.style.borderColor = "#ea4335"
          isValid = false
        } else {
          field.style.borderColor = "#dee2e6"
        }
      } else if (!field.value.trim()) {
        field.style.borderColor = "#ea4335"
        isValid = false
      } else {
        field.style.borderColor = "#dee2e6"
      }
    })

    if (nextBtn) nextBtn.disabled = !isValid
    return isValid
  }

  function validatePaymentForm() {
    const requiredFields = [gcashNumber].filter((field) => field)
    let isValid = true

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = "#ea4335"
        isValid = false
      } else {
        field.style.borderColor = "#dee2e6"
      }
    })

    return isValid
  }

  // Navigation functions
  function goToSummary() {
    if (validateScheduleForm()) {
      saveToLocalStorage()
      populateReviewSection()
      showSection(step1ReviewSection)
      updateProgressSteps(2)
    } else {
      alert("Pakikumpletuhin ang lahat ng kinakailangang field at pumili ng uri ng serbisyo.")
    }
  }

  function goBackToScheduleForm() {
    showSection(scheduleFormSection)
    updateProgressSteps(1)
  }

  function goToAcknowledgement() {
    showSection(acknowledgementSection)
    updateProgressSteps(3)
  }

  function goBackToStep1Review() {
    showSection(step1ReviewSection)
    updateProgressSteps(2)
  }

  function goToPayment() {
    if (acknowledgementTerms?.checked) {
      populatePaymentSection()
      showSection(paymentSection)
      updateProgressSteps(4)
    } else {
      alert("Pakikilala ang mga tuntunin at kondisyon upang magpatuloy.")
    }
  }

  function goBackToAcknowledgement() {
    showSection(acknowledgementSection)
    updateProgressSteps(3)
  }

  function processGcashPayment() {
    if (validatePaymentForm()) {
      // Show verification modal
      document.getElementById("gcash-verification-modal").style.display = "block"
    } else {
      alert("Pakikumpletuhin ang lahat ng detalye ng bayad.")
    }
  }

  function verifyPayment() {
    const code = verificationCode.value.trim()

    if (code.length !== 6) {
      alert("Mangyaring ilagay ang tamang 6-digit verification code.")
      return
    }

    // Simulate verification (in real app, this would call an API)
    if (code === "123456" || code.length === 6) {
      // Close verification modal
      document.getElementById("gcash-verification-modal").style.display = "none"

      // Generate transaction ID
      const transactionId = generateTransactionId()

      // Update receipt section
      updateReceiptSection(transactionId)

      // Save final data
      saveToLocalStorage()

      // Show receipt section
      showSection(receiptSection)
      updateProgressSteps(5)
    } else {
      alert("Mali ang verification code. Subukan ulit.")
    }
  }

  function cancelSchedule() {
    if (
      confirm(
        "Sigurado ba kayong gusto ninyong kanselahin ang iskedyul na ito? Mawawala ang lahat ng naipasok na datos.",
      )
    ) {
      localStorage.removeItem("churchScheduleData")
      window.location.href = "user-dashboard.html"
    }
  }

  function printReceipt() {
    window.print()
  }

  function returnToDashboard() {
    localStorage.removeItem("churchScheduleData")
    window.location.href = "user-dashboard.html"
  }

  function showSection(section) {
    // Hide all sections
    const sections = [scheduleFormSection, step1ReviewSection, acknowledgementSection, paymentSection, receiptSection]
    sections.forEach((s) => {
      if (s) s.style.display = "none"
    })

    // Show target section
    if (section) section.style.display = "block"

    // Scroll to top
    window.scrollTo(0, 0)
  }

  function updateProgressSteps(currentStep) {
    progressSteps.forEach((step, index) => {
      const stepNum = index + 1
      step.classList.remove("active", "completed")

      if (stepNum === currentStep) {
        step.classList.add("active")
      } else if (stepNum < currentStep) {
        step.classList.add("completed")
      }
    })
  }

  function populateReviewSection() {
    // Service information
    document.getElementById("review-service-type").textContent = serviceNames[selectedService]

    // Get preferred date and time based on service
    let preferredDate, preferredTime
    if (selectedService === "BAPTISM") {
      preferredDate = document.getElementById("preferredBaptismDate")?.value
      preferredTime = document.getElementById("preferredBaptismTime")?.value
    } else if (selectedService === "CONFIRMATION") {
      preferredDate = document.getElementById("preferredConfirmationDate")?.value
      preferredTime = document.getElementById("preferredConfirmationTime")?.value
    } else if (selectedService === "COMMUNION") {
      preferredDate = document.getElementById("preferredCommunionDate")?.value
      preferredTime = document.getElementById("preferredCommunionTime")?.value
    } else if (selectedService === "WEDDING") {
      preferredDate = document.getElementById("preferredWeddingDate")?.value
      preferredTime = document.getElementById("preferredWeddingTime")?.value
    } else if (selectedService === "FUNERAL") {
      preferredDate = document.getElementById("preferredFuneralDate")?.value
      preferredTime = document.getElementById("preferredFuneralTime")?.value
    } else if (selectedService === "INTENTION") {
      preferredDate = document.getElementById("preferredIntentionDate")?.value
      preferredTime = document.getElementById("preferredIntentionTime")?.value
    }

    document.getElementById("review-date").textContent = formatDate(preferredDate)
    document.getElementById("review-time").textContent = formatTime(preferredTime)
    document.getElementById("review-fee").textContent = `₱${fees[selectedService]?.toLocaleString()}.00`

    // Service-specific details
    const serviceDetailsContainer = document.getElementById("review-service-details")
    serviceDetailsContainer.innerHTML = getServiceSpecificReview()
  }

  function populatePaymentSection() {
    document.getElementById("payment-service").textContent = serviceNames[selectedService]

    let preferredDate, preferredTime
    if (selectedService === "BAPTISM") {
      preferredDate = document.getElementById("preferredBaptismDate")?.value
      preferredTime = document.getElementById("preferredBaptismTime")?.value
    } else if (selectedService === "CONFIRMATION") {
      preferredDate = document.getElementById("preferredConfirmationDate")?.value
      preferredTime = document.getElementById("preferredConfirmationTime")?.value
    } else if (selectedService === "COMMUNION") {
      preferredDate = document.getElementById("preferredCommunionDate")?.value
      preferredTime = document.getElementById("preferredCommunionTime")?.value
    } else if (selectedService === "WEDDING") {
      preferredDate = document.getElementById("preferredWeddingDate")?.value
      preferredTime = document.getElementById("preferredWeddingTime")?.value
    } else if (selectedService === "FUNERAL") {
      preferredDate = document.getElementById("preferredFuneralDate")?.value
      preferredTime = document.getElementById("preferredFuneralTime")?.value
    } else if (selectedService === "INTENTION") {
      preferredDate = document.getElementById("preferredIntentionDate")?.value
      preferredTime = document.getElementById("preferredIntentionTime")?.value
    }

    document.getElementById("payment-date").textContent = formatDate(preferredDate)
    document.getElementById("payment-time").textContent = formatTime(preferredTime)
    document.getElementById("payment-fee").textContent = `₱${fees[selectedService]?.toLocaleString()}.00`

    // Auto-fill payment amount
    if (paymentAmount) {
      paymentAmount.value = `₱${fees[selectedService]?.toLocaleString()}.00`
    }
  }

  function updateReceiptSection(transactionId) {
    const receiptDate = document.getElementById("receipt-date")
    const receiptService = document.getElementById("receipt-service")
    const receiptDatetime = document.getElementById("receipt-datetime")
    const receiptAmount = document.getElementById("receipt-amount")
    const receiptGcash = document.getElementById("receipt-gcash")
    const transactionIdElement = document.getElementById("transaction-id")

    if (transactionIdElement) transactionIdElement.textContent = transactionId
    if (receiptDate) receiptDate.textContent = new Date().toLocaleDateString()
    if (receiptService) receiptService.textContent = serviceNames[selectedService]
    if (receiptGcash) receiptGcash.textContent = gcashNumber.value

    let preferredDate, preferredTime
    if (selectedService === "BAPTISM") {
      preferredDate = document.getElementById("preferredBaptismDate")?.value
      preferredTime = document.getElementById("preferredBaptismTime")?.value
    } else if (selectedService === "CONFIRMATION") {
      preferredDate = document.getElementById("preferredConfirmationDate")?.value
      preferredTime = document.getElementById("preferredConfirmationTime")?.value
    } else if (selectedService === "COMMUNION") {
      preferredDate = document.getElementById("preferredCommunionDate")?.value
      preferredTime = document.getElementById("preferredCommunionTime")?.value
    } else if (selectedService === "WEDDING") {
      preferredDate = document.getElementById("preferredWeddingDate")?.value
      preferredTime = document.getElementById("preferredWeddingTime")?.value
    } else if (selectedService === "FUNERAL") {
      preferredDate = document.getElementById("preferredFuneralDate")?.value
      preferredTime = document.getElementById("preferredFuneralTime")?.value
    } else if (selectedService === "INTENTION") {
      preferredDate = document.getElementById("preferredIntentionDate")?.value
      preferredTime = document.getElementById("preferredIntentionTime")?.value
    }

    if (receiptDatetime) receiptDatetime.textContent = `${formatDate(preferredDate)} at ${formatTime(preferredTime)}`
    if (receiptAmount) receiptAmount.textContent = `₱${fees[selectedService]?.toLocaleString()}.00`
  }

  function getServiceSpecificReview() {
    let html = ""

    if (selectedService === "BAPTISM") {
      const childLastName = document.getElementById("childLastName")?.value || ""
      const childFirstName = document.getElementById("childFirstName")?.value || ""
      const childMiddleName = document.getElementById("childMiddleName")?.value || ""
      const childGender = document.getElementById("childGender")?.value || ""
      const birthProvince = document.getElementById("birthProvince")?.value || ""
      const birthCity = document.getElementById("birthCity")?.value || ""
      const childBirthDate = document.getElementById("childBirthDate")?.value || ""

      html += `
        <div class="review-row">
          <div class="review-label">Pangalan ng Bibinyagan:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Name:
                </span>
          </div>
          <div class="review-value">${childFirstName} ${childMiddleName} ${childLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Kasarian:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender:
                </span>
          </div>
          <div class="review-value">${childGender}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Lugar ng Kapanganakan:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Place of Birth:
                </span>
          </div>
          <div class="review-value">${birthCity}, ${birthProvince}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Petsa ng Kapanganakan:
              <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Date of Birth:
                </span>
          </div>
          <div class="review-value">${formatDate(childBirthDate)}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Principal Sponsors:</div>
          <div class="review-value">${principalNinongCount} Ninong, ${principalNinangCount} Ninang</div>
        </div>
        <div class="review-row">
          <div class="review-label">Secondary Sponsors:</div>
          <div class="review-value">${secondaryNinongCount} Ninong, ${secondaryNinangCount} Ninang</div>
        </div>
      `
    } else if (selectedService === "CONFIRMATION") {
      const confirmandLastName = document.getElementById("confirmandLastName")?.value || ""
      const confirmandFirstName = document.getElementById("confirmandFirstName")?.value || ""
      const confirmandMiddleName = document.getElementById("confirmandMiddleName")?.value || ""
      const confirmandGender = document.getElementById("confirmandGender")?.value || ""
      const confirmandAge = document.getElementById("confirmandAge")?.value || ""
      const baptizedAt = document.getElementById("baptizedAt")?.value || ""

      html += `
        <div class="review-row">
          <div class="review-label">Pangalan ng Kukumpilan:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Name:      
                </span>
          </div>
          <div class="review-value">${confirmandFirstName} ${confirmandMiddleName} ${confirmandLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Kasarian:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender:
                </span>
          </div>
          <div class="review-value">${confirmandGender}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Edad:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Age:
                </span>
          </div>
          <div class="review-value">${confirmandAge} taon</div>
        </div>
        <div class="review-row">
          <div class="review-label">Bininyagan Sa:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Baptized in:
                </span>
          </div>
          <div class="review-value">${baptizedAt}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Bilang ng Sponsors:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Number of Sponsors:
                </span>
          </div>
          <div class="review-value">${sponsorCount}</div>
        </div>
      `
    } else if (selectedService === "COMMUNION") {
      const communionChildLastName = document.getElementById("communionChildLastName")?.value || ""
      const communionChildFirstName = document.getElementById("communionChildFirstName")?.value || ""
      const communionChildMiddleName = document.getElementById("communionChildMiddleName")?.value || ""
      const communionChildGender = document.getElementById("communionChildGender")?.value || ""
      const communionChildAge = document.getElementById("communionChildAge")?.value || ""
      const communionBaptizedAt = document.getElementById("communionBaptizedAt")?.value || ""

      html += `
        <div class="review-row">
          <div class="review-label">Pangalan ng Makakakomunyon:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Name:
                </span>
          </div>
          <div class="review-value">${communionChildFirstName} ${communionChildMiddleName} ${communionChildLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Kasarian:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Gender:
                </span>
          </div>
          <div class="review-value">${communionChildGender}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Edad:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Age:
                </span>
          </div>
          <div class="review-value">${communionChildAge} taon</div>
        </div>
        <div class="review-row">
          <div class="review-label">Bininyagan Sa:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Baptized in:
                </span>
          </div>
          <div class="review-value">${communionBaptizedAt}</div>
        </div>
      `
    } else if (selectedService === "WEDDING") {
      const groomFirstName = document.getElementById("groomFirstName")?.value || ""
      const groomLastName = document.getElementById("groomLastName")?.value || ""
      const groomMiddleName = document.getElementById("groomMiddleName")?.value || ""
      const brideFirstName = document.getElementById("brideFirstName")?.value || ""
      const brideLastName = document.getElementById("brideLastName")?.value || ""
      const brideMiddleName = document.getElementById("brideMiddleName")?.value || ""

      html += `
        <div class="review-row">
          <div class="review-label">Pangalan ng Lalaki:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Groom's Name:
                </span>
          </div>
          <div class="review-value">${groomFirstName} ${groomMiddleName} ${groomLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Pangalan ng Babae:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Bride's Name:
                </span>
          </div>
          <div class="review-value">${brideFirstName} ${brideMiddleName} ${brideLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Bilang ng Ninong:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Number of Godfather:
                </span>
          </div>
          <div class="review-value">${weddingNinongCount}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Bilang ng Ninang:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Number of Godmother:
                </span>
          </div>
          <div class="review-value">${weddingNinangCount}</div>
        </div>
      `
    } else if (selectedService === "FUNERAL") {
      const funeralServiceType = document.getElementById("funeralServiceType")?.value || ""
      const deceasedFirstName = document.getElementById("deceasedFirstName")?.value || ""
      const deceasedLastName = document.getElementById("deceasedLastName")?.value || ""
      const deceasedMiddleName = document.getElementById("deceasedMiddleName")?.value || ""
      const deceasedMaritalStatus = document.getElementById("deceasedMaritalStatus")?.value || ""
      const relationshipToDeceased = document.getElementById("relationshipToDeceased")?.value || ""

      html += `
        <div class="review-row">
          <div class="review-label">Uri ng Serbisyo:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Type of Funeral:
                </span>
          </div>
          <div class="review-value">${funeralServiceType}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Pangalan ng Patay:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Name:
                </span>
          </div>
          <div class="review-value">${deceasedFirstName} ${deceasedMiddleName} ${deceasedLastName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Estado sa Buhay:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  State in life:
                </span>
          </div>
          <div class="review-value">${deceasedMaritalStatus.replace("_", " ")}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Relasyon sa Namatay:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Relationship with the deceased:
                </span>
          </div>
          <div class="review-value">${relationshipToDeceased.replace("_", " ")}</div>
        </div>
      `
    } else if (selectedService === "INTENTION") {
      const intentionType = document.getElementById("intentionType")?.value || ""
      const requesterName = document.getElementById("requesterName")?.value || ""

      // Get intention names
      const intentionNames = []
      for (let i = 1; i <= intentionNamesCount; i++) {
        const nameField = document.getElementById(`intentionName${i}`)
        if (nameField && nameField.value) {
          intentionNames.push(nameField.value)
        }
      }

      html += `
        <div class="review-row">
          <div class="review-label">Uri ng Intensyon:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Type of Intention:
                </span>
          </div>
          <div class="review-value">${intentionType.replace("_", " ")}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Nag-request:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  Requestor:
                </span>
          </div>
          <div class="review-value">${requesterName}</div>
        </div>
        <div class="review-row">
          <div class="review-label">Para Kay/Kina:
            <br>
                <span style="font-style: italic; font-size: 0.95em; color: #555;">
                  For:
                </span>
          </div>
          <div class="review-value">${intentionNames.join(", ")}</div>
        </div>
      `
    }

    return html
  }

  function formatDate(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("tl-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatTime(timeString) {
    if (!timeString) return ""
    const [hour, minute] = timeString.split(":")
    const hourInt = Number.parseInt(hour)
    const period = hourInt >= 12 ? "PM" : "AM"
    const hour12 = hourInt % 12 || 12
    return `${hour12}:${minute} ${period}`
  }

  function generateTransactionId() {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")

    return `GC-${year}${month}${day}-${random}`
  }

  function saveToLocalStorage() {
    const scheduleData = {
      serviceType: selectedService,
      serviceDetails: getServiceSpecificData(),
      acknowledgementAccepted: acknowledgementTerms?.checked || false,
      paymentInfo: {
        gcashNumber: gcashNumber?.value || "",
        amount: fees[selectedService] || 0,
        paid: true,
      },
    }

    localStorage.setItem("churchScheduleData", JSON.stringify(scheduleData))
  }

  function getServiceSpecificData() {
    const data = {}

    if (selectedService === "BAPTISM") {
      data.preferredDate = document.getElementById("preferredBaptismDate")?.value || ""
      data.preferredTime = document.getElementById("preferredBaptismTime")?.value || ""
      data.childLastName = document.getElementById("childLastName")?.value || ""
      data.childFirstName = document.getElementById("childFirstName")?.value || ""
      data.childMiddleName = document.getElementById("childMiddleName")?.value || ""
      data.childGender = document.getElementById("childGender")?.value || ""
      data.birthProvince = document.getElementById("birthProvince")?.value || ""
      data.birthCity = document.getElementById("birthCity")?.value || ""
      data.childBirthDate = document.getElementById("childBirthDate")?.value || ""
      data.fatherLastName = document.getElementById("fatherLastName")?.value || ""
      data.fatherFirstName = document.getElementById("fatherFirstName")?.value || ""
      data.fatherMiddleName = document.getElementById("fatherMiddleName")?.value || ""
      data.fatherBirthProvince = document.getElementById("fatherBirthProvince")?.value || ""
      data.fatherBirthCity = document.getElementById("fatherBirthCity")?.value || ""
      data.motherLastName = document.getElementById("motherLastName")?.value || ""
      data.motherFirstName = document.getElementById("motherFirstName")?.value || ""
      data.motherMiddleName = document.getElementById("motherMiddleName")?.value || ""
      data.motherBirthProvince = document.getElementById("motherBirthProvince")?.value || ""
      data.motherBirthCity = document.getElementById("motherBirthCity")?.value || ""
      data.marriageType = document.getElementById("marriageType")?.value || ""
      data.baptismCompleteAddress = document.getElementById("baptismCompleteAddress")?.value || ""
      data.baptismCellphone = document.getElementById("baptismCellphone")?.value || ""
      data.principalNinongCount = principalNinongCount
      data.principalNinangCount = principalNinangCount
      data.secondaryNinongCount = secondaryNinongCount
      data.secondaryNinangCount = secondaryNinangCount

      // Collect principal sponsors data
      data.principalSponsors = []
      for (let i = 1; i <= principalNinongCount; i++) {
        const sponsor = {
          type: "ninong",
          lastName: document.getElementById(`principalNinongLastName${i}`)?.value || "",
          firstName: document.getElementById(`principalNinongFirstName${i}`)?.value || "",
          middleName: document.getElementById(`principalNinongMiddleName${i}`)?.value || "",
        }
        data.principalSponsors.push(sponsor)
      }
      for (let i = 1; i <= principalNinangCount; i++) {
        const sponsor = {
          type: "ninang",
          lastName: document.getElementById(`principalNinangLastName${i}`)?.value || "",
          firstName: document.getElementById(`principalNinangFirstName${i}`)?.value || "",
          middleName: document.getElementById(`principalNinangMiddleName${i}`)?.value || "",
        }
        data.principalSponsors.push(sponsor)
      }
    } else if (selectedService === "CONFIRMATION") {
      data.preferredDate = document.getElementById("preferredConfirmationDate")?.value || ""
      data.preferredTime = document.getElementById("preferredConfirmationTime")?.value || ""
      data.confirmandLastName = document.getElementById("confirmandLastName")?.value || ""
      data.confirmandFirstName = document.getElementById("confirmandFirstName")?.value || ""
      data.confirmandMiddleName = document.getElementById("confirmandMiddleName")?.value || ""
      data.confirmandGender = document.getElementById("confirmandGender")?.value || ""
      data.confirmandBirthProvince = document.getElementById("confirmandBirthProvince")?.value || ""
      data.confirmandBirthCity = document.getElementById("confirmandBirthCity")?.value || ""
      data.confirmandBirthDate = document.getElementById("confirmandBirthDate")?.value || ""
      data.baptizedAt = document.getElementById("baptizedAt")?.value || ""
      data.confirmandAge = document.getElementById("confirmandAge")?.value || ""
      data.confirmandFatherLastName = document.getElementById("confirmandFatherLastName")?.value || ""
      data.confirmandFatherFirstName = document.getElementById("confirmandFatherFirstName")?.value || ""
      data.confirmandFatherMiddleName = document.getElementById("confirmandFatherMiddleName")?.value || ""
      data.confirmandMotherLastName = document.getElementById("confirmandMotherLastName")?.value || ""
      data.confirmandMotherFirstName = document.getElementById("confirmandMotherFirstName")?.value || ""
      data.confirmandMotherMiddleName = document.getElementById("confirmandMotherMiddleName")?.value || ""
      data.sponsorCount = sponsorCount

      // Collect sponsors data
      data.sponsors = []
      for (let i = 1; i <= sponsorCount; i++) {
        const sponsor = {
          lastName: document.getElementById(`sponsorLastName${i}`)?.value || "",
          firstName: document.getElementById(`sponsorFirstName${i}`)?.value || "",
          middleName: document.getElementById(`sponsorMiddleName${i}`)?.value || "",
        }
        data.sponsors.push(sponsor)
      }
    } else if (selectedService === "COMMUNION") {
      data.preferredDate = document.getElementById("preferredCommunionDate")?.value || ""
      data.preferredTime = document.getElementById("preferredCommunionTime")?.value || ""
      data.communionChildLastName = document.getElementById("communionChildLastName")?.value || ""
      data.communionChildFirstName = document.getElementById("communionChildFirstName")?.value || ""
      data.communionChildMiddleName = document.getElementById("communionChildMiddleName")?.value || ""
      data.communionChildGender = document.getElementById("communionChildGender")?.value || ""
      data.communionChildBirthProvince = document.getElementById("communionChildBirthProvince")?.value || ""
      data.communionChildBirthCity = document.getElementById("communionChildBirthCity")?.value || ""
      data.communionChildBirthDate = document.getElementById("communionChildBirthDate")?.value || ""
      data.communionBaptizedAt = document.getElementById("communionBaptizedAt")?.value || ""
      data.communionChildAge = document.getElementById("communionChildAge")?.value || ""
      data.communionFatherLastName = document.getElementById("communionFatherLastName")?.value || ""
      data.communionFatherFirstName = document.getElementById("communionFatherFirstName")?.value || ""
      data.communionFatherMiddleName = document.getElementById("communionFatherMiddleName")?.value || ""
      data.communionMotherLastName = document.getElementById("communionMotherLastName")?.value || ""
      data.communionMotherFirstName = document.getElementById("communionMotherFirstName")?.value || ""
      data.communionMotherMiddleName = document.getElementById("communionMotherMiddleName")?.value || ""
    } else if (selectedService === "WEDDING") {
      data.preferredDate = document.getElementById("preferredWeddingDate")?.value || ""
      data.preferredTime = document.getElementById("preferredWeddingTime")?.value || ""
      data.groomLastName = document.getElementById("groomLastName")?.value || ""
      data.groomFirstName = document.getElementById("groomFirstName")?.value || ""
      data.groomMiddleName = document.getElementById("groomMiddleName")?.value || ""
      data.brideLastName = document.getElementById("brideLastName")?.value || ""
      data.brideFirstName = document.getElementById("brideFirstName")?.value || ""
      data.brideMiddleName = document.getElementById("brideMiddleName")?.value || ""
      data.weddingNinongCount = weddingNinongCount
      data.weddingNinangCount = weddingNinangCount
    } else if (selectedService === "FUNERAL") {
      data.funeralServiceType = document.getElementById("funeralServiceType")?.value || ""
      data.preferredDate = document.getElementById("preferredFuneralDate")?.value || ""
      data.preferredTime = document.getElementById("preferredFuneralTime")?.value || ""
      data.deceasedLastName = document.getElementById("deceasedLastName")?.value || ""
      data.deceasedFirstName = document.getElementById("deceasedFirstName")?.value || ""
      data.deceasedMiddleName = document.getElementById("deceasedMiddleName")?.value || ""
      data.deceasedNickname = document.getElementById("deceasedNickname")?.value || ""
      data.deceasedAddress = document.getElementById("deceasedAddress")?.value || ""
      data.deceasedBirthDate = document.getElementById("deceasedBirthDate")?.value || ""
      data.numberOfChildren = document.getElementById("numberOfChildren")?.value || ""
      data.deceasedMaritalStatus = document.getElementById("deceasedMaritalStatus")?.value || ""
      data.deathDate = document.getElementById("deathDate")?.value || ""
      data.placeOfDeath = document.getElementById("placeOfDeath")?.value || ""
      data.causeOfDeath = document.getElementById("causeOfDeath")?.value || ""
      data.lastRites = document.getElementById("lastRites")?.value || ""
      data.confession = document.getElementById("confession")?.value || ""
      data.relationshipToDeceased = document.getElementById("relationshipToDeceased")?.value || ""
    } else if (selectedService === "INTENTION") {
      data.preferredDate = document.getElementById("preferredIntentionDate")?.value || ""
      data.preferredTime = document.getElementById("preferredIntentionTime")?.value || ""
      data.intentionType = document.getElementById("intentionType")?.value || ""
      data.requesterName = document.getElementById("requesterName")?.value || ""
      data.requesterCellphone = document.getElementById("requesterCellphone")?.value || ""
      data.intentionMessage = document.getElementById("intentionMessage")?.value || ""

      // Get intention names
      data.intentionNames = []
      for (let i = 1; i <= intentionNamesCount; i++) {
        const nameField = document.getElementById(`intentionName${i}`)
        if (nameField && nameField.value) {
          data.intentionNames.push(nameField.value)
        }
      }
      data.intentionNamesCount = intentionNamesCount
    }

    return data
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `

    // Add notification to body
    document.body.appendChild(notification)

    // Add close button functionality
    const closeBtn = notification.querySelector(".notification-close")
    closeBtn.addEventListener("click", () => {
      notification.remove()
    })

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 5000)
  }

  function getNotificationIcon(type) {
    switch (type) {
      case "success":
        return "check-circle"
      case "error":
        return "exclamation-circle"
      case "warning":
        return "exclamation-triangle"
      case "info":
        return "info-circle"
      default:
        return "info-circle"
    }
  }

  // Debounce function
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
})
