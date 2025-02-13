// Custom Radio Button Values
try {
  show = false;
  const parentIntance = utils.getDataParentComponent(instance)
  const parentData = parentIntance?._data
  if(parentData?.formOptions?.TwentyFourHour || parentData?.formOptions?.TwelveHour){
    show = true
  } else {
    show = false;
  }
} catch (error) {
  console.error(error);
};

 try {
    // Get the parent component containing formOptions
    const parentInstance = utils.getDataParentComponent(instance);
    const parentData = parentInstance?._data;
    let options = [];
    if (parentData?.formOptions?.TwelveHour === true) {
      options = [
        { label: "Alcohol 90.3(2)", value: "alcohol" },
        { label: "Drugs 90.3(2.1)", value: "drugs" }
      ];
    } else if (parentData?.formOptions?.TwentyFourHour === true) {
      options = [
        { label: "Alcohol 215(2)", value: "alcohol" },
        { label: "Drugs 215(3)", value: "drugs" }
      ];
    } else {
      options = [
        { label: "Alcohol 90.3(2)", value: "alcohol" },
        { label: "Drugs 90.3(2.1)", value: "drugs" }
      ];
    }
    // Set the options to the component
    instance.component.values = options;
 
      // Trigger a redraw to update the UI
    instance.redraw();


  } catch (error) {
    console.warn('Error in radio options calculation:', error);
  };


// get parent data from nested components

try {
  show = false;
  const parentIntance = utils.getDataParentComponent(instance)
  const parentData = parentIntance?._data
  if(parentData.formOptions?.TwentyFourHour || parentData.formOptions?.TwelveHour){
    show = true
  } else {
    show = false;
  }
} catch (error) {
  console.error(error);
}
;


// get data from nested object usign key
// console.log(getValueByKey(parentData, 'TwelveHour')); // false

const getValueByKey = (obj, searchKey) => {
  const findKey = (object) => {
      for (const key in object) {
          if (key === searchKey) return object[key];
          if (_.isObject(object[key])) {
              const result = findKey(object[key]);
              if (result !== undefined) return result;
          }
      }
      return undefined;
  };
  
  return findKey(obj);
};




// Set the options based on the data// disableing check boxes
if (data.formOptions) {
  if (data?.formOptions?.TwentyFourHour) {
    instance.refs.input.forEach((input) => {
      if (input.value === 'TwelveHour') {
        input.disabled = true;
      }
    });
  } else {
    instance.refs.input.forEach((input) => {
      if (input.value === 'TwelveHour') {
        input.disabled = false;
      }
    });
  }
  
  
  
  if (data?.formOptions?.TwelveHour) {
    instance.refs.input.forEach((input) => {
      if (input.value === 'TwentyFourHour') {
        input.disabled = true;
      }
    });
  } else {
    instance.refs.input.forEach((input) => {
      if (input.value === 'TwentyFourHour') {
        input.disabled = false;
      }
    });
  }
  
}



// load the form list in hidden component

function getFormList() {
  const domain = localStorage.getItem('formsflow.ai.url');
  const formioToken = localStorage.getItem('formioToken');

  if (!domain || !formioToken) {
    console.error('Domain or token not found in localStorage');
    return;
  }
  
  const formKeys = [
            "driversInformation",
            "vehicleInformation", 
            "registeredOwnerInfo",
            "childVehicleImpoundOrDisposition",
            "childDispositionOfVehicle",
            "vehicleImpoundmentIRP",
            "childVehicleImpoudmentReason",
            "childExcessiveSpeed",
            "childUnlicensedDriver",
            "childLinkageFactors",
            "childReasonableGrounds",
            "childTestAdministered",
            "childProhibitionForm",
            "childIncidentDetails",
            "rsRoadSafteyMainForm"
        ]

  const apiUrl = `${domain}/formio/form?type=form&limit=20&name__in=` + formKeys.join(",");

  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-jwt-token': formioToken
    }
  })
    .then(response => response.json())
    .then(formList => {
      if (formList.length > 0) {
        // Create an object with keys as the form paths and values as the form objects
      const formObject = formList.reduce((acc, form) => {
        acc[form.name] = form; // Use the form's name as the key
        return acc;
      }, {});

      // Pass the form object to instance.setValue
      instance.setValue(formObject);
      } else {
        console.error('No forms found in the list');
      }
    })
    .catch(error => {
      console.error('Error fetching form list:', error);
    });
}

if(data?.formListHidden === ''){
  getFormList()
}

// use the form list from hidden compoennt to nested form
const updateForm = (instance, data, key) => {
  if (instance?.data?.newForm?._id !== instance?.subForm?.form?._id) {
    instance.subForm.form = instance.data.newForm;
  }
  instance.data.newForm = data?.formListHidden?.[key];
};
updateForm(instance, data, component.key);

// if (instance?.data?.newForm && instance.subForm.form && instance.data.newForm._id !== instance.subForm.form._id) {
//   // Update the nested form if the stored form is different
//   instance.subForm.form = instance.data.newForm;
// }
// if(data?.formListHidden && data.formListHidden!= ''){
//   instance.data.newForm = data.formListHidden[component.key]
// }

// Hide and show the form
try {
  show = false;
  if(data?.formOptions?.VI || data?.formOptions?.TwentyFourHour || data?.formOptions?.TwelveHour){
    show = true;

  } else {
    show = false;
  }
} catch (error) {
  console.error(error);
}

;


// Scan DL button logic
// Define supported scanners
const supportedScanners = [
  { vendorId: 0x0801, productId: 0x0002 }, // MagTek - USB Swipe Reader
  { vendorId: 0x0980, productId: 0x91f0 }, // Posh Manufacturing - MX5-K9
];

// Scanner utility functions
const dlScanner = {
  async getScanner() {
    const device_list = await navigator.hid.getDevices();
    return device_list[0];
  },

  async requestAccessToScanner() {
    let devices = await navigator.hid.requestDevice({
      filters: supportedScanners,
    });
    return devices[0];
  },

  async openScanner() {
    try {
      let scanner = await this.getScanner();
      if (!scanner) {
        scanner = await this.requestAccessToScanner();
      }

      if (scanner && scanner.opened) {
        return scanner;
      } else {
        await scanner.open();
        return scanner;
      }
    } catch (e) {
      console.error('Scanner error:', e);
      return null;
    }
  },

  async readFromScanner(device, reportId, data) {
    return await new Promise((resolve) => {
      const magStripe = String.fromCharCode.apply(
        null,
        new Uint8Array(data.buffer)
      );
      resolve(this.parseAAMVA2009(magStripe));
    });
  },

  parseAAMVA2009(magStripe) {
    let tracks = magStripe.split("?");

    const track1 = tracks[0].match(
      /%([A-Z]{2})([^^]{0,13})\^?([^^]{0,35})\^?([^^]{0,74})?/
    );

    var track2 = tracks[1].match(
      /;(\d{6})(\d{0,13})(=)(\d{4})(\d{8})(\d{0,5})?/
    );

    var track3 = tracks[2].match(/%0A.{11}.{2}.{10}.{4}(.{1})/);

    var province = track1[1];
    var city = track1[2];
    var name = track1[3].match(/([^$]{0,35}),\$?([^$]{0,35})?/);
    var address = track1[4].match(
      new RegExp("^(.+)\\$(.+)\\s(" + province + ")\\s*(.{6,7})$")
    );

    return {
      province: province,
      city: city,
      name: (function () {
        if (!name) return;
        return {
          surname: name[1],
          given: name[2],
        };
      })(),
      address: (function () {
        if (!address) return;
        return {
          street: address[1],
          city: address[2],
          province: address[3],
          postalCode: address[4],
        };
      })(),
      iso_iin: track2[1],
      number: track2[2],
      expiration: this.parseDate(track2[4]),
      dob: (function () {
        var dob = track2[5].match(/(\d{4})(\d{2})(\d{2})/);
        if (!dob) return;
        return dob[1] + dob[2] + dob[3];
      })(),
      gender: track3[1],
    };
  },

  parseDate(date) {
    var start = parseInt(date[0] + date[1]);
    if (start < 13) {
      return (
        date[4] +
        date[5] +
        date[6] +
        date[7] +
        date[0] +
        date[1] +
        date[2] +
        date[3]
      );
    }
    return date;
  },
};

// Form.io custom action function
const scannerAction = async function (data) {
  // Create modal elements
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;

  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    font-family: Arial, sans-serif;
  `;

  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = `
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  modalHeader.innerHTML = `
    <span>Scan Driver's License</span>
    <button style="background: none; border: none; font-size: 20px; cursor: pointer;">&times;</button>
  `;

  const modalBody = document.createElement('div');
  modalBody.style.cssText = `
    margin-bottom: 16px;
    color: #555;
  `;
  modalBody.textContent = 'Requesting access to the DL scanner...';

  const modalFooter = document.createElement('div');
  modalFooter.style.cssText = `
    display: flex;
    justify-content: flex-end;
  `;

  const cancelButton = document.createElement('button');
  cancelButton.style.cssText = `
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = () => document.body.removeChild(modal);

  modalFooter.appendChild(cancelButton);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalContent.appendChild(modalFooter);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // Close modal when clicking the "X" button
  modalHeader.querySelector('button').onclick = () => document.body.removeChild(modal);

  // Scanner handler function
  const handleScannedBarcode = async (event) => {
    const { data, device, reportId } = event;
    try {
      const dl_data = await dlScanner.readFromScanner(device, reportId, data);

      // Update form values
      const dob_year = dl_data.dob.slice(0, 4);
      const dob_month = dl_data.dob.slice(4, 6);
      const dob_day = dl_data.dob.slice(6, 8);

      // Update form.io submission data
      data.driver_licence_no = dl_data.number;
      data.driver_last_name = dl_data.name.surname;
      data.driver_given_name = dl_data.name.given;
      data.driver_dob = new Date(dob_year, dob_month - 1, dob_day);
      data.driver_address = dl_data.address.street;
      data.driver_city = dl_data.address.city;
      data.driver_prov_state = 'CA_BC';
      data.driver_postal = dl_data.address.postalCode;

      const dl_expiry_year = "20" + dl_data.expiration.slice(0, 2);
      const dl_expiry_month = dl_data.dob.slice(4, 6);
      const dl_expiry_day = dl_data.dob.slice(6, 8);
      data.driver_licence_expiry = new Date(
        `${dl_expiry_year}/${dl_expiry_month}/${dl_expiry_day}`
      );

      data.gender = dl_data.gender === 'M' ? 'male' : 'female';

      // Close modal
      document.body.removeChild(modal);
    } catch (err) {
      console.error('Error reading DL:', err);
      modalBody.textContent = 'Error reading driver\'s license. Please try again.';
    }
  };

  // Initialize scanner
  try {
    const scanner = await dlScanner.openScanner();
    if (scanner) {
      modalBody.textContent = 'Please scan BC Driver\'s License now.';
      scanner.addEventListener('inputreport', handleScannedBarcode);
    } else {
      modalBody.textContent = 'Unable to access scanner. Please try again.';
    }
  } catch (err) {
    console.error('Scanner initialization error:', err);
    modalBody.textContent = 'Error initializing scanner. Please try again.';
  }
};

scannerAction(data);



// Confirmation modal on a button click


const content = instance.ce('div');
content.innerHTML = `
  <div class="modal-content" style="min-width: 400px; padding: 20px;">
    <div class="modal-header" style="border-bottom: 1px solid #dee2e6; margin: -20px -20px 20px; padding: 20px;">
      <h5 class="modal-title" style="font-size: 1.25rem; margin: 0;">
        <i class="fas fa-exclamation-circle text-warning" style="margin-right: 8px;"></i>
        Confirm Action
      </h5>
    </div>
    
    <div class="modal-body" style="padding: 0 0 20px;">
      <p style="font-size: 1rem; color: #555; margin: 0;">
        Are you sure you want to proceed with this action?
      </p>
    </div>
    
    <div class="modal-footer" style="border-top: 1px solid #dee2e6; margin: 0 -20px -20px; padding: 20px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn btn-outline-secondary" ref="cancelButton" style="min-width: 100px;">
        <i class="fas fa-times" style="margin-right: 5px;"></i>Cancel
      </button>
      <button class="btn btn-primary" ref="confirmButton" style="min-width: 100px;">
        <i class="fas fa-check" style="margin-right: 5px;"></i>Confirm
      </button>
    </div>
  </div>
`;

// Create the modal
const modal = instance.createModal(content);

// Add event listeners
const confirmButton = content.querySelector('[ref="confirmButton"]');
const cancelButton = content.querySelector('[ref="cancelButton"]');

confirmButton.addEventListener('click', () => {
  // Your confirmation logic here
  console.log('User confirmed');
  modal.close();
});

cancelButton.addEventListener('click', () => {
  console.log('User cancelled');
  modal.close();
});

// Add escape key listener
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    modal.close();
    document.removeEventListener('keydown', handleEscape);
  }
};
document.addEventListener('keydown', handleEscape);