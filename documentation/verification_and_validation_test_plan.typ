#set page(
  margin : (
    top  : 8em,
  ),
)

#set heading(
  numbering : "(1.1)",
)

#set par(
  justify : true,
)

#set text(
  size : 13pt,
)

#set enum(
  spacing : 2em,
)

#set list(
  spacing : 2em,
)

#show heading : set block(
  above : 2em,
  below : 1em,
)

#show heading.where(level : 1) : set text(
  size : 20pt,
)

#show heading.where(level : 2) : set text(
  size : 14pt,
)

#show quote.where(block : true) : set block(
  breakable : false,
)

#show quote.where(block : true): block.with(
  fill   : luma(245),
  radius : 3pt,
  inset  : (
    left : 1em,
    rest : 1em,
  ),
  stroke : (
    left : 2pt + luma(120),
  ),
)

#show quote.where(block : true) : set text(
  style : "italic",
)

#show quote.where(block : true) : set block(
  above: 1em,
  below: 1em,
)

#set page(

  header : context [

    #set text(size : 12pt)

    #grid(
      columns : (1fr , auto ),
      align   : (left, right),
      [
        S27-54: Health Monitor for Newborn Foals and Their Mothers \
        Verification & Validation Test Plan
      ],
      [
        Page #counter(page).get().first()
      ],
    )

    #v(-6pt)
    #line(length : 100%, stroke : 0.5pt + gray)
    #v(1em)

  ],

)

#let TODO(..args) = {

  let body = if args.pos().len() >= 1 { args.pos().at(0) } else { [] }

  box(
    fill   : rgb("FFEEEE"),
    stroke : rgb("FF5555") + 0.5pt,
    inset  : (x : 4pt, y : 0pt),
    outset : (         y : 3pt),
    radius : 2pt,
    [
      #text(fill : rgb("D32F2F"), weight : "bold")[
        TODO#if body != [] [:] #body
      ]
    ]
  )

}

#let standard-table(
  title      : none,
  label-name : none,
  caption    : none,
  breakable  : false,
  size       : 1em,
  alignment  : center + horizon,
  columns    : auto,
  headers    : (),
  ..rows,
) = {

  let the-table = table(
    columns : columns,
    inset   : 6pt,
    align   : alignment,
    ..headers.map(
      h => table.cell(fill : rgb("#7B1F3A"))[#text(fill : white, weight: "bold")[#h]]
    ),
    ..rows.pos(),
  )

  align(center)[

    #if title != none [
      *#title*
    ]

    #show figure : set block(
      breakable : breakable
    )

    #show table.cell : set text(
      size: size,
    )

    #if caption == none {
      the-table
    } else {

      let the-figure = figure(
        caption : caption,
        the-table,
      )

      if label-name == none [
        #the-figure
      ] else [
        #the-figure
        #label(label-name)
      ]

    }

  ]

}

#let standard-image(
  caption : none,
  path    : none,
) = {

  align(center)[
    #figure(
      caption : caption,
      image(path),
    )
  ]

}

#let standard-quote(
  attribution,
  body,
) = {

  quote(
    block       : true,
    attribution : attribution,
  )[
    #body
  ]

}





////////////////////////////////////////////////////////////////////////////////





#align(center)[
  #table(
    columns   : 2,
    stroke    : none,
    align     : (right, left),
    [*Document Title       *], [Verification & Validation Test Plan],
    [*Document \#          *], [VV-1                               ],
    [*Revision \#          *], [1                                  ],
    [*Previous Doc/Rev \#  *], [N/A                                ],
  )
]

#v(2em)

#standard-table(

  title   : [CHANGE HISTORY],
  size    : 0.8em,
  columns : (auto  , auto  , auto                         , auto                  , auto                    ),
  headers : ([Rev.], [Date], [Detailed Change Description], [Affected \ Documents], [Supporting \ Documents]),

  [01], [10/23/2026], [
    Initial Release
  ], [
    N/A
  ], [
    N/A
  ],

)

#pagebreak()





////////////////////////////////////////////////////////////////////////////////





#outline(
    title : "TABLE OF CONTENTS",
)

#v(1em)

#outline(
  title  : none,
  target : figure.where(kind: image),
)

#v(1em)

#outline(
  title  : none,
  target : figure.where(kind: table),
)

#pagebreak()





////////////////////////////////////////////////////////////////////////////////





= Overview and Objectives

This document presents the verification and validation plan
for the S27-54 project:
a non-invasive, wearable health-monitoring system
for equine patients in intensive care.
Sensor data is processed on-board
and transmitted over Wi-Fi
to a desktop application,
where vitals are displayed in real time
and alerts may be issued when a reading or detected event
falls outside configured patient-specific criteria.

The purpose of this document
is to define how the implemented system
will be evaluated
against the product requirements
and target specifications
in the requirements specification.

_*Verification*_
confirms, through testing, inspection,
demonstration,
and analysis,
that the system satisfies its specified requirements.

_*Validation*_
establishes that the system
is suitable for its intended use
and addresses the customer's needs
within the expected operating environment.

Testing is organized at three levels:
subsystem (individual sensor and hardware modules),
integrated system (all sensors connected to the main MCU),
and end-user interface (the desktop application
and its interaction with the device).
The planned activities
include
functional and accuracy testing
against reference measurements,
demonstration of system behaviors
and safety features,
performance testing
of the wireless link
and alert delivery,
and inspection of the harness
and mechanical enclosure.

The objectives of this plan are to:

#list(
  spacing: 1em,
  [
    Identify the tests required
    to evaluate each applicable product requirement.
  ],
  [
    Define the methodology,
    success criteria,
    and responsible engineer
    for each test.
  ],
  [
    Provide a process
    for documenting failures
    and tracking corrective actions.
  ],
  [
    Record assumptions and requirements
    found to be incomplete or unrealistic.
  ],
)

If testing reveals
that a requirement,
target specification,
or test method
is unrealistic or incomplete,
the proposed change
is to be documented
and reviewed
through the project's design-change process.

#pagebreak()





////////////////////////////////////////////////////////////////////////////////





= Assumptions

#list(
  spacing: 1em,
  [
    Subsystem tests
    may use bench equipment,
    simulated signals,
    or a human-subject proxy
    when testing on an equine subject
    is unavailable.
    A human-subject measurement
    demonstrates signal-acquisition capability only
    and does not constitute validation
    of equine-specific accuracy.
  ],
  [
    If a commercial reference monitor
    is available,
    it is to be used
    as the accuracy reference
    for heart-rate and respiratory-rate testing.
    If a commercial reference
    is unavailable or unsuitable,
    a manual measurement
    by a trained handler
    is to be used as the reference instead.
  ],
  [
    Testing on an equine subject,
    if available,
    provides preliminary evidence
    of device operation
    under intended patient conditions.
    A limited live-subject test
    does not establish
    clinical effectiveness
    or universal performance.
  ],
  [
    Equine-subject testing
    is to follow a rest–activity–rest protocol:
    a baseline measurement
    is taken while the subject is at rest,
    the subject is then allowed
    to perform light activity
    with the device in place,
    and a follow-up measurement
    is taken after the subject
    has returned to rest.
    This protocol evaluates signal acquisition
    under differing conditions
    and does not establish
    a reference-standard accuracy measurement.
  ],
  [
    Movement-event testing
    is to use direct observation
    by a trained observer
    for a window of 10–30 minutes,
    supplemented by video footage
    when available.
    A single observer
    and a limited observation period
    may not provide sufficient evidence
    to confirm the movement-detection
    accuracy requirements (PER-3, PER-4, PER-5).
    Any data-sufficiency limitation
    is to be recorded with the results.
  ],
  [
    The system
    is not assumed to include
    a custom battery-charging circuit.
    Battery-life testing
    evaluates operation
    using replaceable off-the-shelf batteries
    (which they themselves may be rechargeable and reusable).
  ],
  [
    The delivery of alerts
    to subscribed staff
    depends on the hospital's
    existing intranet and messaging infrastructure.
    The availability
    and configuration
    of that infrastructure
    are treated as external dependencies
    and are to be confirmed
    with IT staff
    before alert-delivery testing
    is conducted.
  ],
  [
    Testing in the medical center's
    actual stall environment
    is not assumed to be available.
    Tests are to be conducted
    in a laboratory or equivalent setting.
    Environmental limitations
    of the test location
    are to be documented
    with the results.
  ],
  [
    Live-animal testing
    is to be performed only
    under veterinary supervision,
    with required permissions
    and predefined stop conditions.
  ],
  [
    Test results
    apply only to the hardware,
    firmware, software,
    sensor placement,
    battery,
    and configuration
    used during that specific test.
  ],
)





////////////////////////////////////////////////////////////////////////////////





#page(
  flipped : true,
)[

  = Subsystem Identification & Master Test Table

  #standard-table(
    title      : none,
    label-name : none,
    caption    : [Master test table.],
    breakable  : true,
    size       : 0.8em,
    alignment  : center + horizon,
    columns    : (auto     , 7em        , 8em                , 1fr   , auto                 , auto                    ),
    headers    : ([Test \#], [Subsystem], [Key \ Requirement], [Test], [Primary \ Resources], [Responsible \ Engineer]),

    [B1],
    [Battery \ Regulation],
    [POW-1, POW-2, \ POW-3, POW-4],
    [Long-term battery current draw and voltage level monitoring.],
    [AD3 USB oscilloscope],
    [Kevin Lee],

    [B2],
    [Battery \ Protection],
    [POW-2, I/O-5],
    [Short circuit, over-discharge, and over temperature detection],
    [AD3 USB oscilloscope, electronic load],
    [Joshua Bryant],

    [I1],
    [Wireless \ Communication],
    [FUN-7, PER-6, \ COM-1],
    [Long-term telemetry logging of network connectivity uptime.],
    [Equine Center Network (IT staff)],
    [Phuc Doan],

    [M1],
    [Heart Monitor],
    [FUN-1, FUN-2],
    [Demonstrate heart rate measurement and rhythm of subjects under different conditions.],
    [Test subject (Wesley/foal)],
    [Phuc Doan],

    [M2],
    [Respiration \ Monitor],
    [FUN-3, FUN-4, PER-2],
    [Demonstrate respiration measurement and rhythm of subjects under different conditions.],
    [Test subject (Wesley/foal)],
    [Kevin Lee],

    [M3],
    [Body IMU],
    [FUN-5],
    [Correlate collected data with observations.],
    [Angular movement test jig],
    [Kevin Lee],

    [D1],
    [Harness],
    [ME-1, ME-3, ME-4],
    [Demonstrate patient comfort and harness safety],
    [Test subject (Wesley/foal)],
    [Diego Penadillo],

    [D2],
    [Casing Durability],
    [ME-1, ME-3, ME-4],
    [Demonstrate enclosure resilience against impact and load],
    [Stress rig],
    [Josh Bryant],


    [W1],
    [UI],
    [FUN-6, PER-6],
    [Show the alerts come in a timely manner (60s)],
    [User Interface ],
    [Jerry Cheng],

    [W2],
    [UI-2],
    [FUN-3, FUN-4, \ FUN-5],
    [Show that UI can display correct readings from the sensors],
    [User Interface],
    [Jerry Cheng],
  )
]





////////////////////////////////////////////////////////////////////////////////





= Detailed Test Cases

== Test Case B1: Battery Regulation

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
     Battery.
  ],
  [
    _*Type*_:
    Functional / Performance.
  ],
  [
    _*Significance*_:
    This test verifies that the fully assembled monitoring system can operate continuously on battery power for at least 24 hours. It also evaluates the system's current consumption during idle and active operation, battery voltage stability, and overall power efficiency. The collected measurements will be used to evaluate battery performance and determine whether the system can meet the minimum operating time requirement POW-1.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Verify all connections between sensors, MCU, wireless communication, and battery input are secure. Fully charge the battery and record its measured capacity (from cell charger) and initial voltage. Ensure that the system is configured with the firmware intended for normal use.
      ],
      [
        *Instrumentation*. \
        Connect a power analyzer in series with the battery input to measure the total current drawn by the system.
        Ensure that the power analyzer can capture short wireless transmission spikes. Connect the AD3 oscilloscope to the battery in 'logger' mode to monitor battery voltage over a prolonged period.

      ],
      [
        *Idle Current Measurement*. \
        Power on the system and allow it to enter its normal idle state without active wireless transmission. Record the instantaneous current consumption.
      ],

      [
        *Active Current Measurement*. \
        Operate the system under normal monitoring conditions, including sensor measurements, data processing, and wireless transmission. Record the instantaneous during each activity and identify peak current during wireless transmission.
      ],

      [
        *Representative Monitoring Period*. \
        Operate the system continuously for a predetermined monitoring period (30–60 minutes) under normal operating conditions. Record the duration spent in each operating state, including idle, sensor acquisition, data processing, and wireless transmission. Measure the average current consumption during each state to calculate the time-weighted average current consumption over the predetermined monitoring period. Use this average to extrapolate the battery capacity required for 24 hours of operation.
      ],

      [
        *Long-Term Battery Test*. \
        Fully recharge the battery and operate the system continuously for at least 24 hours under the same monitoring configuration used during the representative monitoring period. Record battery current and voltage throughout the test. Verify that the system continues collecting and transmitting sensor data.
      ],

      [
        *Final Analysis*. \
        Calculate the average current consumption and total battery capacity consumed during the 24-hour test. Compare these measurements against the predicted values obtained from the representative monitoring period. Identify any significant differences and determine whether the system satisfies the minimum 24-hour battery-life requirement.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Current Measurements*. \
        Record idle current (mA), average active current (mA), peak transmission current (mA), and the time-weighted average current consumption (mA) during the representative monitoring period.
      ],
      [
        *Voltage Measurements*. \
        Record initial battery voltage (V), battery voltage throughout the test, and final battery voltage (V). Identify any unexpected voltage drops.
      ],
      [
        *Battery Performance*. \
        Record the duration of idle and active operation, predicted 24-hour battery capacity consumption (mAh), measured 24-hour capacity consumption (mAh), and the difference between predicted and measured values.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Battery Life*. \

        Target: The system operates continuously on battery power for at least 24 hours while performing its intended monitoring and wireless communication functions.

        Marginal: The system shuts down or becomes unable to perform its required monitoring functions before completing 12 hours due to insufficient battery power.
      ],

      [
        *Current Consumption and Prediction Accuracy*. \

        Target: The average current measured during the 24-hour test is consistent with the predicted average current calculated from the representative monitoring period.

        Marginal: The measured average current differs noticeably from the predicted value, but the system still satisfies the 24-hour operating requirement. Differences should be investigated.
      ],
      [
        *Voltage Stability*. \

        Target: Battery voltage remains within the acceptable operating range throughout the 24-hour test, with no unexpected system resets or power-related interruptions.

        Marginal: Temporary voltage drops occur during peak current consumption but do not interrupt system operation or cause the supply voltage to fall below the minimum operating threshold.
      ],

    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Battery Safety*. \
        Inspect the battery for swelling, physical damage, or exposed wiring before beginning the test. Do not use a damaged battery.
      ],
      [
        *Electrical Safety*. \
        Ensure the measurement equipment is connected correctly and that its voltage and current ratings are not exceeded. Avoid accidental short circuits when connecting the power analyzer or oscilloscope. Use an appropriate protected measurement setup during long-term testing.
      ],
      [
        *Monitoring and Abort Conditions*. \
        Monitor the system for excessive heating and unexpected voltage drops. Stop the test immediately if the battery shows swelling, smoke, or other unsafe behavior. Do not discharge the battery below its specified safe cutoff voltage.
      ],
    )
  ],
)



== Test Case B2: Battery Protection

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
   Battery.
  ],
  [
    _*Type*_:
    Functional, performance, and safety verification (hardware test of the fully assembled battery subsystem).
  ],
  [
    _*Significance*_:
     The battery regulation subsystem supplies all power to the EPR and is the main safety barrier against fire, overheating, and cell damage. This test verifies that the pack delivers its rated power, that the BMS reports state of charge accurately, and that the protection features activate correctly with the pack sealed inside its enclosure, where heat cannot escape as easily as on an open bench. It verifies requirements POW-2 and I/O-5.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Visually inspect the enclosure, wiring, and connectors for cracks, pinched wires, swelling, or loose terminals. Do not continue if any are found. Confirm the battery is installed and the enclosure lid is closed and fastened as it would be in the final build. Connect to the MCU and confirm its communication with the BMS by checking reported SOC, pack voltage, temperature, and fault conditions.

      ],
      [
        *Instrumentation*. \
        Connect the power analyzer to the DC bus and connect the calibrated DC electronic load to the pack output. Connect to internal pack thermocouple directly or indirectly through BMS. Connect AD3 channel 1 to the pack output voltage, channel 2 across the current shunt, and the thermocouple to the thermocouple logger.
      ],
      [
        *Discharge*. \
        Let the pack rest for 30 minutes with the enclosure closed. Discharge at a constant rate within battery manufacturer specifications using the electronic load until BMS indicates 0% SOC and insure battery has reached minimum safe voltage. Demonstrate that SOC from BMS and battery voltage are corelated.
      ],
      [
        *Overdischarge*. \
        Recharge the pack to 100% and let it rest for 30 minutes. Discharge at a constant rate within battery manufacturer specifications using the electronic load until BMS indicates 0% SOC. Then, continue discharging battery with electronic load until BMS terminates discharge or battery reaches minimum allowable voltage.
      ],
      [
        *Overcurrent*. \
        Recharge the pack to 100% and let it rest for 30 minutes. Use electronic load to increase current draw until predetermined overcurrent threshold is reached. Use recorded voltage and current data from AD3 to ensure that BMS cuts power to the system when this threshold is crossed.
      ],
            [
        *Overtemperature*. \
        Recharge the pack to 100% and let it rest for 30 minutes. While recording the cell temperature through the thermocouple, apply a controlled heat source (a hot air reflow gun) set to the maximum temperature recommended by the battery manufacturer. Verify that when the thermocouple exceeds the maximum battery temperature threshold, the BMS cuts power to the system.
      ],
      [
        *Short Circuit*. \
        Recharge the pack to 100% and let it rest for 30 minutes. Use a low value resistor to intentionally short the BMS output rails and verify the BMS cuts power to the system by reviewing recorded voltage and current data.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Sample rates*. \
        1Hz for long-duration charge and discharge logs and 1kHz or faster for fault protection trip response times.
      ],
      [
        *Captured channels*. \
        Pack voltage (V), pack current (A), cell voltage(s) (V), BMS SOC (%), BMS error codes/signals, cell temperature (#sym.degree;C), and timestamps for all data.
      ],
      [
        *File format*. \
        AD3 waveform and thermocouple data are saved as CSV (plus a screenshot for each trip event).
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
       [
        *Discharge*. \
        Demonstrate that SOC from BMS and battery voltage are corelated (100% SOC at max battery voltage, 0% at minimum).
      ],
      [
        *Overdischarge*. \
        BMS sends appropriate signal to MCU and terminates discharge when battery reaches minimum allowable voltage.
      ],
      [
        *Overcurrent*. \
        BMS sends appropriate signal to MCU and cuts power to the system when maximum system current threshold is exceeded.
      ],
            [
        *Overtemperature*. \
        When the thermocouple (and by extension the battery pack) exceeds the maximum battery temperature threshold, the BMS sends appropriate signal to MCU and cuts power to the system.
      ],
      [
        *Short Circuit*. \
        BMS sends appropriate signal to MCU and cuts power to the system when system power rails are shorted.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Location and equipment*. \
        Perform all charging and discharging in a battery test cabinet if available, otherwise on a non-flammable surface away from flammable materials and water. Keep a lithium battery fire suppression/containment system nearby, and a class ABC fire extinguisher for other fires caused by battery. Never leave the pack unattended while it is charging or under load.
      ],
      [
        *Personal protective equipment*. \
        Wear safety glasses when making or changing connections. Use non conductive tools and remove metal jewelry. Make all connections with the load and charger turned off.
      ],
      [
        *Electrical safety*. \
        Short-circuit protection is verified only through designated tests or the current-limited electronic load. Check the current limit settings before each step and keep AD3 inputs within their rated voltage range.
      ],
      [
        *Abort conditions*. \
        Immediately stop the test and disconnect the charger or load if there is smoke, a burning smell, hissing, visible swelling, enclosure softening, any cell above 60#sym.degree;C, or a temperature rise faster than 10#sym.degree;C per minute. Move the pack into the lithium battery fire suppression/containment system using insulated gloves and step back.
      ],
    )
  ],
)



== Test Case I1: Wireless Communication

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    RF / Networking Link.
  ],
  [
    _*Type*_:
    Performance / Reliability.
  ],
  [
    _*Significance*_:
    This test verifies that a reliable Wi-Fi telemetry link
    can be established and maintained
    between the medical device and the desktop application,
    with sustained data transfer
    and clean recovery
    from a loss of connection.
    Compatibility with the hospital's existing network infrastructure
    is confirmed under FUN-7.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Confirm the device is associated with the hospital Wi-Fi network
        or a network with equivalent SSID, channel,
        and security configuration.
        Verify the desktop application,
        running on the same network,
        displays the device as connected
        and is receiving telemetry data.
      ],
      [
        *Continuous Telemetry*. \
        Operate the device in continuous monitoring mode for 30 minutes.
        Record the total number of packets transmitted
        from the main MCU counter
        and the total number of packets received
        from the desktop application log.
        Compute the packet-loss percentage.
        Note the number and duration
        of any reconnection events
        that occur spontaneously during the window.
      ],
      [
        *Disconnect and Reconnect (Desktop)*. \
        Disable Wi-Fi on the desktop machine for 30 seconds.
        Verify the user interface
        indicates loss of connection
        to the device.
        Re-enable Wi-Fi on the desktop machine.
        Record the elapsed time
        until the user interface
        indicates the device has reconnected
        and telemetry data resumes.
        Confirm the on-board network-status indicator (LED),
        if visible,
        is consistent with the reconnected state.
      ],
      [
        *Disconnect and Reconnect (Device)*. \
        Disable Wi-Fi on the device for 30 seconds
        (e.g., by physically detaching the antenna
        or toggling a power/reset switch on the RF module).
        Verify the user interface
        indicates loss of connection
        to the device.
        Confirm the on-board network-status indicator (LED)
        reflects the disconnection
        (e.g., red blinking).
        Re-enable Wi-Fi on the device.
        Record the elapsed time
        until the user interface
        indicates the device has reconnected
        and telemetry data resumes.
        Verify the LED returns to the nominal state
        (e.g., steady green).
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Throughput*. \
        Total packets transmitted and received
        over the 30-minute continuous window,
        the computed packet-loss percentage,
        and the number
        and duration
        of any spontaneous reconnection events.
      ],
      [
        *Reconnection*. \
        For each disconnect/reconnect step,
        the elapsed time
        from restoration
        to resumed telemetry,
        and the LED state
        before and after.
      ],
      [
        *Environment*. \
        Wi-Fi SSID, channel, and security mode;
        approximate distance
        from the access point;
        desktop application version;
        and operating system version.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Packet Loss*. \

        Target: \<1% over the 30-minute continuous window.

        Marginal: \<5% over the 30-minute continuous window.
      ],
      [
        *Spontaneous Reconnection*. \
        No sustained loss of connection
        exceeding 5s
        is to occur
        during the 30-minute window.

        Target: 0 spontaneous disconnects.

        Marginal: no more than 1,
        with automatic recovery
        within 30s.
      ],
      [
        *Directed Reconnection*. \
        Following either the desktop-side
        or the device-side disconnect,
        the link is re-established
        and telemetry resumes
        within 30s
        of Wi-Fi restoration.
        The on-board network-status indicator
        correctly reflects
        the disconnection
        and the subsequent recovery.
      ],
      [
        *Coexistence (FUN-7)*. \
        The device
        operates on the hospital network
        (or an equivalent)
        without requiring
        configuration changes
        to the existing infrastructure.
        No interference
        with other network services
        is to be observed
        during the test.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Network Safety*. \
        If the test
        is conducted on the hospital's production network,
        prior coordination
        with IT staff
        is required.
        A dedicated SSID or virtual LAN
        is preferred
        to avoid disruption
        of clinical communication systems.
      ],
      [
        *Subject safety*. \
        If the device
        is mounted on a live subject
        during this test,
        an equine handler
        is to remain present
        for the duration
        of the procedure.
      ],
    )
  ],
)



== Test Case M1: Heart Monitoring

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    Heart Rate / ECG Sensor.
  ],
  [
    _*Type*_:
    Functional / Accuracy.
  ],
  [
    _*Significance*_:
    This test verifies that the heart-rate sensor
    acquires a valid cardiac signal
    and reports a rate
    within #sym.plus.minus;2 BPM
    of a commercial reference monitor (PER-1, FUN-1).
    If a commercial reference
    is unavailable,
    a manual heart-rate measurement
    by a trained handler
    is used as the reference.
    The capture and interpretability
    of the ECG waveform
    is assessed under FUN-2,
    if implemented.
    Measurements taken on a human-subject proxy,
    if used,
    demonstrate signal-acquisition capability only
    and do not constitute validation
    of equine heart-rate accuracy.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Attach the heart-rate sensor
        to the test subject
        at the designated anatomical location.
        Confirm that a cardiac waveform
        is visible in the user interface.
        Allow 2 minutes
        for the reading to stabilize.
        Record the subject under test,
        the sensor location,
        and the device configuration.
      ],
      [
        *Simultaneous Measurement at Rest*. \
        If a commercial reference heart-rate monitor
        (e.g., a veterinary pulse oximeter
        or a medical-grade ECG lead)
        is available,
        activate it on the same subject
        at the same time.
        Record both readings
        every 5 seconds
        for 5 minutes
        while the subject is at rest.
        Note any intervals
        in which one device loses tracking
        and the other does not.

        If a commercial reference
        is not available,
        a trained handler or team member
        is to perform a manual heart-rate measurement
        (auscultation or pulse palpation)
        at the start and end
        of a 5-minute rest period,
        and the device's average reading
        over that period
        is to be compared
        to the manual value.
      ],
      [
        *Measurement Under Light Activity*. \
        Have the subject perform light activity
        (slow walking, head turning, ear movement)
        for 5 minutes.
        Record the device reading
        every 5 seconds.
        If a reference device is in use,
        record its reading as well.
        Note the number of intervals
        in which the device
        produces no reading
        or a clearly implausible value
        (e.g., \<20 BPM or >200 BPM).
        If using manual measurements,
        record the manual heart rate
        and the time of each measurement.
      ],
      [
        *ECG Waveform Inspection (FUN-2)*. \
        Capture 30 seconds
        of the ECG waveform
        as exported by the device
        while the subject is at rest,
        and save the data to file.
        A team member
        is to visually inspect the waveform
        for a regular repeating cardiac cycle.
        The qualitative assessment
        is to be recorded in writing,
        noting whether the cycle
        is regular,
        the approximate period,
        and any obvious artifacts
        or noise.
      ],
      [
        *Repeat and Consistency*. \
        If a second subject
        or a second test day
        is available,
        the rest and activity measurements
        are to be repeated
        to assess day-to-day
        or subject-to-subject consistency.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Paired Readings*. \
        Timestamped pairs
        of the device heart rate (BPM)
        and the reference value (BPM)
        for each 5-second interval,
        separated by condition
        (rest versus light activity).
        The reference is either
        the commercial monitor reading
        or the manual measurement,
        as applicable.
      ],
      [
        *ECG Waveform*. \
        A 30-second ECG waveform capture,
        as exported by the device,
        saved as CSV or an equivalent format.
      ],
      [
        *Tracking Quality*. \
        The number of valid
        versus total 5-second intervals
        for each condition,
        and a list of intervals
        in which the device
        produced no reading
        or an implausible value.
      ],
      [
        *Context*. \
        Subject under test,
        sensor location and attachment method,
        the make and model
        of the reference device
        (if used),
        the name
        of the person
        performing any manual assessment,
        and the device firmware version.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Heart-rate accuracy (PER-1)*. \

        Target: mean absolute error
        #sym.lt.eq;2 BPM
        across all paired rest-condition readings.

        Marginal: #sym.lt.eq;5 BPM.
        When a manual measurement
        is used as the reference,
        the same thresholds apply
        to the difference
        between the device's average reading
        over the measurement window
        and the manual value.
      ],
      [
        *Tracking success*. \

        Target: #sym.gt.eq;95% of 5-second intervals produce a valid reading at rest.

        Marginal: #sym.gt.eq;80% of 5-second intervals produce a valid reading at rest.
      ],
      [
        *ECG waveform (FUN-2)*. \
        Qualitative pass/fail.
        The waveform,
        as exported by the device,
        displays a regular repeating cardiac cycle
        with a consistent period
        and no sustained flat-line
        or noise-dominant segments.
        The result
        is documented
        by the team member's written assessment.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Equine safety*. \
        An equine expert
        or an experienced handler
        is to remain present
        for the duration
        of all equine testing.
        The sensor,
        and the device overall,
        must not restrict blood flow,
        cause skin irritation,
        or impede normal movement.
        The skin at the sensor site
        is to be inspected
        after the test.
      ],
      [
        *Human-proxy safety*. \
        If a team member
        is used as a proxy,
        any institutional
        human-subject requirements
        are to be observed.
        The test is non-invasive and low-risk;
        the subject
        is free to remove the sensor
        at any time.
      ],
      [
        *Abort conditions*. \
        The test is to be stopped
        if the subject displays signs of distress,
        if the sensor site
        becomes red or irritated,
        or if the reference measurement
        indicates a condition
        that the equine expert
        cannot immediately rule out.
      ],
    )
  ],
)



== Test Case M2: Respiration Monitor

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    Respiration Rate / Monitoring.
  ],
  [
    _*Type*_:
    Functional / Accuracy.
  ],
  [
    _*Significance*_:
    This test verifies that the respiratory monitoring subsystem can accurately measure respiratory rate and monitor respiratory patterns. The subsystem's measurements will be compared against a commercial respiratory monitor under resting and light activity conditions. This test evaluates compliance with system requirements FUN-3, FUN-4, and PER-2.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Attach the respiratory sensor to the test subject. Verify that all connections are secure and that the sensor does not restrict normal breathing. Power on the system and confirm that respiratory measurements are being recorded.
      ],
      [
        *Instrumentation*. \
        Attach a commercial respiratory monitor to the same test subject according to its operating instructions. Confirm that both devices are reporting respiratory rate measurements. If supported by the commercial monitor, configure it to display respiratory waveforms for comparison.
      ],
      [
        *Respiratory Rate Measurement at Rest*. \
        Allow the subject to remain at rest for 5 minutes. Record respiratory rate measurements from both devices at the same time every 30 seconds for 5 minutes. Compare the measurements to evaluate the accuracy of the respiratory  monitoring subsystem.
      ],
      [
        *Respiratory Rate Measurement During Light Activity*. \
        Under appropriate supervision, allow the subject to perform normal light activity. Record respiratory rate measurements from both devices every 30 seconds for 5 minutes. Compare the results and identify any missing or inconsistent measurements.
      ],
      [
        *Respiratory Pattern Monitoring*. \
        If the commercial monitor provides respiratory waveforms, compare the breathing patterns recorded by both devices during rest and light activity. Compare the timing and consistency of breaths recorded by both devices and identify any differences in respiratory patterns or missing measurements.
      ],
      [
        *Final Analysis*. \
        Calculate the absolute difference between respiratory rate measurements from both devices. Evaluate the measurement accuracy against PER-2 and identify any significant discrepancies in respiratory rate or respiratory patterns.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Respiratory Rate Measurements*. \
        Record timestamped respiratory rate measurements (BrPM) from the respiratory monitoring subsystem and commercial reference monitor during resting and light activity conditions.
      ],
      [
        *Measurement Accuracy*. \
        Calculate the absolute difference between the respiratory rate measurements from both devices for each recorded interval.
      ],
      [
        *Respiratory Patterns*. \
        If available, record respiratory waveforms from both devices and identify consistency and timing of breaths.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Respiratory Rate Accuracy*. \

        Target: Respiratory rate measurements remain within #sym.plus.minus;2 BrPM of the commercial reference monitor.

        Failure: Respiratory rate measurements differ from the commercial reference monitor by more than #sym.plus.minus;2 BrPM.
      ],
      [
        *Respiratory Pattern Monitoring*. \

        Target: The respiratory monitoring subsystem records respiratory patterns consistent with those observed on the commercial reference monitor.

        Marginal: The respiratory monitoring subsystem can record respiratory patterns but cannot consistently reproduce the respiratory patterns observed on the commercial reference monitor.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Equine Safety*. \
        Ensure an experienced equine handler is present during testing involving a horse. Verify that the respiratory sensors do not restrict breathing or normal movement.
      ],
      [
        *Subject Monitoring*. \
        Continuously observe the subject for signs of discomfort or distress. Stop testing immediately if any such signs are observed.
      ],
      [
        *Equipment Safety*. \
        Ensure that the respiratory monitoring devices are properly attached. Avoid placing excessive pressure on the subject.
      ],
    )
  ],
)



== Test Case M3: Body IMU

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    Movement Monitor.
  ],
  [
    _*Type*_:
    Functional / Accuracy.
  ],
  [
    _*Significance*_:
    This test verifies that the IMU sensor can detect and record movement and changes in orientation. The IMU sensor's measurements will be compared against known movements performed using an angular movement test jig. The results will be used the evaluate the accuracy and consistency of the movement measurements and verify compliance with system requirement FUN-5.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Pre-Check*. \
        Securely attach the IMU and MCU to the angular movement test jig. Ensure that all connections between the IMU and MCU are secure. Power on the system and confirm that IMU measurements are being recorded.
      ],
      [
        *Instrumentation*. \
        Configure the test jig to allow controlled movement and orientation. Identify the orientation of the IMU's X, Y, and Z axes and establish a starting position for reference.
      ],
      [
        *Stationary Measurement*. \
        Keep the IMU stationary for 5 minutes and records its angular velocity and acceleration measurements. Confirm that the measurements remain stable when no movement occurs.
      ],

      [
        *Orientation Measurement*. \
        Rotate the test jig to predetermined angles (0$degree$, 45$degree$, and 90$degree$) about each axis. Record the IMU measurements and compare the reported orientation against the known angles of the test jig.
      ],
      [
        *Movement Measurement*. \
        Perform a series of controlled movements and rotations using the test jig. Record the IMU's acceleration, angular velocity, and orientation during each movement. Compare the reported measurements against the known movements performed by the test jig. Repeat each movement three times to evaluate measurement consistency.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *IMU Measurements*. \
        Record timestamped angular velocity and acceleration measurements along the X, Y, and Z axes during stationary and active movements.
      ],
      [
        *Orientation Measurements*. \
        Record the predetermined angles of the test jig and corresponding IMU orientation measurements. Identify any differences between the expected and measured orientations.
      ],
      [
        *Movement Detection*. \
        Record the movements performed during each trial and compare them against the IMU's reported measurements. Identify any missed movements or inconsistent readings.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Movement Monitoring*.  \

        Target: The IMU successfully records changes in acceleration and angular velocity corresponding to the movements performed using the test jig.

        Failure: The IMU fails to record movement or produces measurements that do not correspond to the movements performed by the test jig.
      ],
      [
        *Orientation Measurement*. \

        Target: The IMU orientation measurements consistently reflect changes in orientation corresponding to the predetermined angles of the test jig.

        Marginal: The IMU detects changes in orientation but produces inconsistent readings.
      ],
      [
        *Measurement Consistency*. \

        Target: Repeated movements produce consistent IMU measurements without any missing data.

        Marginal: Some measurements are inconsistent, but the IMU continues to detect and record movement.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Equipment Safety*. \
        Ensure that the IMU and MCU are securely attached to the test jig before beginning testing. Verify that all electrical connections are secure during movement.
      ],
      [
        *Controlled Movements*. \
        Perform movements within the mechanical limits of the test jig. Avoid excessive force that could damage the IMU or its connections.
      ],
    )
  ],
)



== Test Case D1: Harness

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    System Mount.
  ],
  [
    _*Type*_:
    Inspection / Demonstration.
  ],
  [
    _*Significance*_:
    The test must demonstrate that the patient can wear the device without any added discomfort. Since the patient will be in enough distress, it is essential that the device does not contribute to the discomfort.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Preparation*. \
        Have an equine expert present during entirety of test. Put the harness on a horse test subject. Adjust the harness to ensure it is snug enough to fit 4 fingers between it and the horse.
      ],
      [
        *Inspection*. \
        Allow the horse to wear the harness for 5 minutes and take note of any signs of discomfort. Adjust if necessary. Take off the harness after 5 minutes of use. Inspect the area where the harness was and take note of any signs of excessive pressure.
      ],
      [
        *Routine Behavior Test*. \
        Allow the horse to be active and engage their usual daily activities for 1 hour and take note of any signs of discomfort. Adjust if necessary. Take off harness after an hour of use. Inspect area where harness was and take note of any signs of excessive pressure or discomfort.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Behavior Indicating Discomfort*. \
        Horses show discomfort through different behaviors involving movement. Some of these behaviors include pinning their ears backwards or tensing their eyes. Since these behaviors vary amongst horses, an equine expert or the horse's owner must be present, since they will be able to tell much clearer when the horse is in discomfort. After the tests, take note of any of these signs, the type of sign, and how many times it was shown
      ],
      [
        *Discomfort Signs on Skin*. \
        The skin where the harness was placed must be inspected to ensure there is no rash or skin irritation after harness use. After the tests, take note of any of these and how severe they are.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Behavior Indicating Discomfort*. \

        Target: The horse shows 0 signs of discomfort when wearing the harness.

        Marginal: Subject shows at most 2 signs of discomfort when wearing the harness.
      ],
      [
        *Discomfort Signs on Skin*. \

        Target: The skin where the harness was placed shows no wear, only slight hair ruffling or wear and no damage to the skin. Similar conditions to when a surcingle is properly placed and used for a long period of time.

        Marginal: The skin where the harness was placed shows hardly any wear, only damage to hair but not the skin. Similar conditions to when wearing a surcingle that was not properly placed but does not damage the horse's skin.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Equine Expert Present*. \
        During any test, an expert or owner must be present. An expert is able to quickly identify any extreme signs of discomfort and better help collect data for feedback. They will also be able to ensure the harness is worn properly and be able to notice when to adjust it much sooner.
      ],
      [
        *Constant Monitoring*. \
        The test will be stopped whenever the horse experiences discomfort. After stopping, the expert and engineer will evaluate whether the test must end due to the harness or if it can be adjusted and continue.
      ],
    )
  ],
)



== Test Case D2: Casing Durability

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
     Casing.
  ],
  [
    _*Type*_:
    Durability Test.
  ],
  [
    _*Significance*_:
    Make sure the casing can withstand heavy pressure and will be durable during normal horse movements such as rolling, trotting, and laying down.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
            *Static Load (Crush)*. \
            Replace the battery with a dummy block of the same size and weight (never test with a live lithium battery). Close and fasten the enclosure. Using calipers, measure and record the height, width, and length at three marked points. Place the enclosure on a flat, hard floor and lay a rigid board (e.g., plywood) on top so the load spreads evenly. Add weight (gym plates or sandbags) in 5kg steps, holding each step for 60 seconds. After each step, measure the height under load and inspect for cracks, layer separation, or bulging. Stop when the target load is reached or visible failure occurs. Remove all weight, wait 5 minutes, and re-measure all dimensions.
      ],
      [
           *Drop*. \
           With the dummy installed and the lid fastened, measure and mark a drop height of 1.0m above a concrete floor. Hold the enclosure so the bottom face points down and release it without throwing. Inspect and photograph it after the drop. Repeat for each of the six faces and one corner (7 drops total). If the enclosure survives, repeat the sequence from 1.5m. Record any cracks, opened lids, broken clips, or movement of the dummy inside.

      ],
      [
            *Repeated Load (Fatigue)*. \
            Using the same setup as the crush test, place the full target load on the enclosure for 10 seconds, then remove it for 10 seconds. This is one cycle. Complete 50 cycles, stopping every 10 cycles to measure the height with calipers and inspect for new cracks or layer separation. Check that the lid still opens, closes, and latches normally at the end of the test.

      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        *Crush*. \
        Record in a table the applied load (kg), the height under load (mm), and any damage observed at each step. Record dimensions before and after the test to calculate permanent deformation (mm), as well as the maximum load reached before failure.
      ],
      [
        *Drop*. \
        For each drop, record the height (m), impact face or corner, and result (no damage / cosmetic scuff / crack / lid opened / broken). Take a photo after every drop and note whether the dummy stayed secure.
      ],
      [
        *Fatigue*. \
        Record the height (mm) every 10 cycles and the cycle number at which any damage first appears. Note whether the lid and fasteners still work at the end. Note the print settings (material, infill %, wall count, layer orientation) so the results can be tied to the print.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Crush*. \

        Target: holds 400kg with no cracks and less than 1mm permanent deformation.

        Marginal: holds 225kg with no cracks and less than 2mm permanent deformation.
      ],
      [
        *Drop*. \

        Target: survives all 7 drops from 1.5m with no cracks, and the contents stays secure.

        Marginal: survives all 7 drops from 1.0m with only cosmetic damage, and the lid stays closed.
      ],
      [
        *Fatigue*. \

        Target: completes 20 cycles with less than 1mm total change in height. Note any changes from the original Requirements Specification values (e.g., if the load requirement was raised after seeing how the enclosure will be used) and explain why.

        Marginal: completes 10 cycles with no cracks and the lid still latching.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        *Battery Safety*. \
        All tests use a dummy block that matches the battery's size and weight. A real lithium battery is never placed in the enclosure during testing, because crushing or dropping one can cause fire, swelling, or toxic smoke. Keep any real batteries in a separate room or a fireproof bag while testing.
      ],
      [
        *Personal Protective Equipment*. \
        Everyone in the test area wears safety glasses, since 3D-printed plastic can shatter into sharp fragments when it fails under load or on impact. Wear closed-toe shoes and work gloves when lifting and placing weights. Lift weights with your legs and add them one at a time rather than dropping them onto the board.
      ],
      [
        *Test Environment*. \
        Run the tests on a flat, clear floor with at least 1m of empty space around the setup and no one standing within arm's reach during loading or drops. Make sure the plywood board is centered so the weight cannot slide or tip off, and keep feet and hands out from under the stack. If the enclosure starts to crack or collapse, stop adding weight and remove the load from the top down. Sweep up any plastic fragments after each test.
      ],
    )
  ],
)



== Test Case W1: UI

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    User Interface & Alert System.
  ],
  [
    _*Type*_:
    Accuracy / Function.
  ],
  [
    _*Significance*_:
    This test verifies that alerts can be displayed on the dashboard, reach to the staff receiving device within 60 seconds of abnormal status detection. Notice this test doesn't include the manual confirmation time from the staff.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Data Preparation*. \
        Record the alert thresholds configuration, intended recipients and timing reference. Supply the reading within normal range for 60 seconds, no alert shall be reported during this period before proceed to next step.
      ],
      [
        *Alert Generation*. \
        Introduce the abnormal monitoring rates through controlled test data.
        Check the alert display on dashboard overview, detailed page, confirmation notification, message status on intended device and record the delivering sequence.
        For message specifically, check the accuracy of data measurement with the correct Foal ID and stall location.
      ],
      [
        *Post-Alert*. \
        Record the time delay after manual confirmation from the UI, check the updated alert status as "Acknowledged" in patient log. Repeat abnormal events with different length for three trials. Notice staff confirmation time and stall check-in time after receiving the alert are not included in this test.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,

      [
      Message alerts accessed on the intended receiving device. Phone will be used for this testing. Content including patient information, alert reason can be verified through screenshots and compared with UI.
      ],
      [
        Recent activity from the Patient Log records the alert onset time. After manual confirmation,  alert offset updated on activity. Verification can be done by screenshots.
      ],
    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        Each qualifying alert events reaches the intended receiving device (expected longer delay from dashboard display) within 60 seconds of detection.
      ],
      [
        Message failure and dashboard failure shall be distinct from each other. If intended notification service or device unavailable, verified as not tested.
      ],
      [
        Patient data like sensing rate, stall location, foal ID need to be correctly displayed. The data triggered alert needs to be represented timely dependent on alert configuration.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
        60 seconds for alert notification begin from detection, display and message notification, while staff operation time can't be predicted.
      ],
      [
        Alert offset shall only be by manual confirmation, not success from message delivery.
      ],
      [
      Alert messages shall not be dependent on the website display. One alert system fails shall not interfere with the other.
      ],
    )
  ],
)



== Test Case W2: U1-2

#list(
  spacing: 1.4em,
  [
    _*Subsystem*_:
    User Interface.
  ],
  [
    _*Type*_:
    Data Security.
  ],
  [
    _*Significance*_:
   This test verifies the authenticity of the telemetry on website display.
   Such part is executed on transmission from MCU to UI display, while sensor measurement accuracy will be tested separately.
   Test includes correct patient information, sensor availability, and data freshness.
  ],
  [
    _*Procedure*_:
    #enum(
      spacing: 1.4em,
      [
        *Data Preparation*. \
        Set limits for display delay, data age, stale indication, recovery, and waveform comparison. Before testing, establish a common timing  reference. Construct a repeatable dataset and configure an MCU test mode. This dataset should contain measurement timestamps, numeric readings, sensor availability, and connection status.
      ],
      [
        *Data Accuracy*. \
        For initial test, hold each sample data for 10 second and then advance to next, which tests the data accuracy without the impact of time delay. Then run a separate timing trial at intended operating rate. Record the delivery time and calculate the display delay as time limits is considered in this real case.
      ],
      [
        *Waveform Comparison*. \
        Transmit the heart rate and respiration rate samples. Compare the display traces with the source data with shape, timing, scaling, and gaps. Notice numerical values displayed on UI shouldn't be applied as evidence for the waveform accuracy.
      ],
      [
        *Sensor Status & Data Recovery*. \
        Configure individual sensor fault states and verify on display, and only proceed when unaffected reading remain accurate. For available hardware, pause on MCU message without offline notice, the readings should be confirmed as stale and sensor status became unknown or stayed at last reading with notice. Restore telemetry, confirm current data is not replaced by the stale records.
      ],
    )
  ],
  [
    _*Data Collection*_:
    #list(
      spacing: 1.4em,
      [
        Observed website display results, including statuses, sensor measurements and waveform data, screenshots can be applied for data collection.
      ],
      [
        Latency information required to be manually calculated from the sender time (MCU) and receiver time (Website) based on the established timing reference.
      ],

    )
  ],
  [
    _*Success Metrics*_:
    #list(
      spacing: 1.4em,
      [
        *Numerical Values*. \
        All readings shall match the MCU data after documented conversion. Measured values needs to be ensured as readable only on UI.
      ],
      [
        *Sensor Status*. \
        Sensor faults shall be represented correctly, with unaffected readings remain displayable, status discrepancy shall be clarified from a confirmed disconnection to a telemetry loss.
      ],
      [
          *Recovery*. \
          Display delay and recovery shall meet the established limits. Long delay won't be marked as error but unaccepted from data freshness. Besides, old records shall not overwrite the new readings once restored.
      ],
    )
  ],
  [
    _*Safety Precautions*_:
    #list(
      spacing: 1.4em,
      [
      *Internal Testing*. \
      The telemetry interruption and physical sensor connection test shall not interfere with the network system of the equine center.
      ],
      [
       *Mock Data*. \
       For applied screenshots on recording test evidence, be aware of removal of unnecessary (mock) identifying information to avoid confusion.
      ],
    )
  ],
)



#pagebreak()





////////////////////////////////////////////////////////////////////////////////





= Conclusion

The system
is a non-invasive, wearable monitor
for foals and mares
that measures heart rate,
respiratory rate,
and patient movement.
Processed data
is transmitted over Wi-Fi
to a desktop application
on the veterinary center's intranet,
where vitals are displayed in real time
and an alert is issued
when a reading falls outside
a nominal window
configured per patient
by the medical staff.

Developing the test plan
required the team
to revisit the project scope
and to clarify
how the subsystems
interact once assembled.
Several requirements
were initially stated
without sufficient specificity
to define a pass/fail criterion,
and their marginal
and target values
were refined
as a result.
Other requirements
were decomposed
into smaller,
individually testable items
to make the test procedures
tractable.
Because some subsystems
are prerequisite
to the operation
of the full system,
their tests
were designed
to be more rigorous
so that a failure
does not delay
the subsequent test schedule.

The primary risk
to test execution
is the dependence
on a live equine subject.
All subject testing
is to be conducted
under the supervision
of an equine expert,
who also provides
the reference observations
against which
the system's readings
are compared
and offers feedback
for design revision.
In terms of test ordering,
the destructive tests
(harness and casing)
consume the units under test
and are to be completed first,
to allow time
for repair
or re-fabrication
before the integration tests proceed.
The remaining tests
may be conducted
in parallel or afterward,
and any failure
is to be addressed
through troubleshooting and retest
without requiring
a physical rebuild.
