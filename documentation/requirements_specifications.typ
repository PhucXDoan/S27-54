//#set page(height: auto)
#set text(size: 13pt)
#set heading(numbering: "(1.1)")
#set par(justify: true)
#set enum(spacing: 2em)
#set list(spacing: 2em)
#set page(margin: (top: 8em))
#show heading: set block(above: 2em, below: 1em)
#show heading.where(level: 1): set text(size: 20pt)
#show heading.where(level: 2): set text(size: 14pt)
#show quote.where(block: true): set block(breakable: false)

#show quote.where(block: true): block.with(
  fill: luma(245),
  inset: (left: 1em, rest: 1em),
  radius: 3pt,
  stroke: (left: 2pt + luma(120)),
)
#show quote.where(block: true): set text(style: "italic")
#show quote.where(block: true): set block(above: 1em, below: 1em)

#let todo(..args) = {
  let body = if args.pos().len() >= 1 {
    args.pos().at(0)
  } else {
    none
  }
  box(
    fill: rgb("FFEEEE"),
    stroke: 0.5pt + rgb("FF5555"),
    inset: (x: 4pt, y: 0pt),
    outset: (y: 3pt),
    radius: 2pt,
    [
      #if body == none or body == [] [
        #text(fill: rgb("D32F2F"), weight: "bold")[TODO]
      ] else [
        #text(fill: rgb("D32F2F"), weight: "bold")[TODO: #body]
      ]
    ]
  )
}

#set page(
  header: context [
    #set text(size: 12pt)
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        S27-54 \
        Requirements Specifications
      ],
      [
        Page #counter(page).get().first()
      ],
    )
    #v(-6pt)
    #line(length: 100%, stroke: 0.5pt + gray)
    #v(1em)
  ]
)



////////////////////////////////////////////////////////////////////////////////



#let maroon = rgb("#7b1f3a")

#align(center)[
  #block(breakable: false)[
    #table(
      columns : 2,
      stroke  : none,
      align   : (right, left),
      [*Document Title       *], [Requirements Specifications],
      [*Document \#          *], [RS-01],
      [*Revision \#          *], [1],
      [*Previous Doc/Rev \#  *], [N/A],
    )
  ]
]

#v(2em)

#align(center)[
  *CHANGE HISTORY*
  #table(
    columns : (auto, auto, auto, auto, auto),
    inset   : 6pt,
    align   : (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),

    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Rev.]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Date]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Detailed Change Description]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Affected \ Documents]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Supporting \ Documents]],

    [01], [9/23/26], [Initial Release], [N/A], [N/A],
  )
]

#v(2em)

#align(center)[
  *DOCUMENT REVIEW AND APPROVAL*
  #table(
    columns : (auto, auto, auto, auto),
    inset   : 6pt,
    align   : (center + horizon, center + horizon, center + horizon, center + horizon),

    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Name]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Title]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Contributed \ Sections]],
    table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Signature/Date]],

    [Adam Sbahi        ], [Project Lead         ], [4.4, 5.2, 5.3], [Sept. 24th, 2026],
    [Joshua Bryant     ], [Engineering          ], [2.2], [Sept. 24th, 2026],
    [Jerry Cheng       ], [Engineering          ], [5.1, 5.2], [Sept. 24th, 2026],
    [Phuc Doan         ], [Engineering          ], [1, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4], [Sept. 24th, 2026],
    [Kevin Lee         ], [Engineering          ], [5.3], [Sept. 24th, 2026],
    [Diego Penadillo   ], [Engineering          ], [3.2, 5.2], [Sept. 24th, 2026],
    [Megan Marchitello ], [Customer             ], [N/A], [#todo[]],
    [Dr. Joe Adams     ], [Mentor               ], [N/A], [#todo[]],
  )
]

#pagebreak()



////////////////////////////////////////////////////////////////////////////////

#outline(
    title: "TABLE OF CONTENTS",
)

#v(1em)

#outline(title: none, target: figure.where(kind: image))

#v(1em)

#outline(title: none, target: figure.where(kind: table))

#pagebreak()



////////////////////////////////////////////////////////////////////////////////

= Purpose

This requirements specifications document defines the customer's needs and constraints.
The primary purpose is to establish a contractual definition of the problem domain
for the customer and the developers of the product.
Hence, the mentioned needs and constraints within this document
are all relevant to the final product implementation
and are the entirety of the project's scope.
This document
does not include specific implementation or architectural details
pertaining to the product.





////////////////////////////////////////////////////////////////////////////////

= Definitions

== Document Definitions

#align(center)[
  #figure(
    table(
      columns : (auto, auto),
      inset   : 6pt,
      align   : (center + horizon, left + horizon),

      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Term]],
      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Definition]],

      [Verification], [
        Confirmation by testing, analysis, demonstration, and/or
        inspection that specified requirements have been fulfilled.
      ],

      [Validation], [
        Establishing objective evidence that system specifications
        conform to user needs and intended uses in the operational
        environment.
      ],

      [Component], [
        One of the parts that make up a system. A component may
        be hardware or software and may be subdivided into
        components.
      ],

    ),
    caption: "Document definitions."
  )
]



== Document Acronyms

#align(center)[
  #figure(
    table(
      columns : (auto, auto),
      inset   : 6pt,
      align   : (center + horizon, left + horizon),

      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Acronym]],
      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Description]],

//      [DHF], [
//        Design History File #todo[Not even used.]
//      ],

      [IEEE], [
        Institute of Electrical and Electronics Engineers
      ],

//      [CR], [
//        Customer Requirements #todo[Not even used.]
//      ],

//      [SR], [
//        System Requirements #todo[Not even used.]
//      ],
//
//      [BOM], [
//        Bill of materials #todo[Not even used.]
//      ],

      [ECG], [
        Electrocardiogram
      ],

//      [IMU], [
//        Intertial measurement unit #todo[Not even used.]
//      ],

      [MCU], [
        Microcontroller unit
      ],

//      [RTM], [
//        Requirements traceability matrix #todo[Not even used.]
//      ],

//      [WBS], [
//        Work breakdown structure #todo[Not even used.]
//      ],

    ),
    caption: "Document acryonyms."
  )
]



////////////////////////////////////////////////////////////////////////////////

#pagebreak()

= Customer Needs

== Problem Statement

During the January-June foaling season,
the Marion duPont Scott Equine Medical Center
provides around-the-clock intensive care
to approximately 100 patients, often newborn foals and their mothers,
a number of which are in critical condition.
Monitoring is performed by nursing and veterinary staff
who assess vitals (e.g., heart rate, respiratory rate, movement)
many times over the course of an entire day
in a 6ft#super[2] to 12ft#super[2] stall.
The cumulative burden
across 2-3 simultaneous patients on routine care
costs the staff great time and effort.
Thus, an electronically automated solution is needed where
continuous, non-invasive monitoring can take place
and be able to send alerts in situations that requires the medical staff's attention.



== Customer Needs Description

The automated medical system will be attached to the patient in a non-invasive manner.
The mounting of the device is designed in such a way that it minimizes additional risk to the patient
(e.g., getting tangled)
and minimizes discomfort (i.e., can be adjusted to foals and mares).
The device, by default,
will incorporate a heart rate sensor,
an ECG sensor,
a respiratory rate sensor,
a respiratory pattern sensor,
and a movement sensor.
For flexibility,
not all sensors are required for functionality of the automated medical system
and can be disconnected from the overall system.
This is to support situations where the mounting of a particular sensor
may be infeasible for a particular patient.

#align(center)[
  #figure(
    image("conops.png"),
    caption: [Top-level system diagram.]
  )
]


The sensors monitor the corresponding vitals of the patient
and send the data to the main MCU by wire.
The main MCU processes the data for any abnormalities,
such as the heart rate BPM being out of the configured nominal window.
The main MCU transmits telemetry via Wi-Fi,
to which the data can be viewed on a desktop application.
The desktop application can display real-time vitals of the patient
or patients if multiple devices are used.
The desktop application will be responsible for sending alerts to all subscribed staff
configured to receive notifications by the system.
The application can be used to dismiss alerts
and reconfigure the automated medical system (e.g., updating the nominal BPM window).

The sensors, main MCU, and battery system are all part of a modular harness
mounted non-invasively to the patient.
The battery system is the component that powers the automated medical system
and will be routinely recharged by the medical staff.
The automated medical system will incorporate diagnostics (e.g., LEDs, buzzers)
to indicate the working condition of the device.
It's intended for the automated medical system to be initially used on around 1-3 patients at a time.

#align(center)[
  #figure(
    table(
      columns : (auto, auto),
      inset   : 6pt,
      align   : (center + horizon, left + horizon),

      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Need]],
      table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Statement]],

      [Continuous monitoring], [
        System shall monitor vitals without staff intervention.
      ],
      [Non-invasive], [
        System shall not restrict foal movement or cause distress.
      ],
      [Timely alerts], [
        Staff shall be notified within 60 seconds of an
        abnormal reading or a system issue (e.g., low battery).
      ],
      [Low maintenance], [
        Battery shall support a full shift without recharge.
      ],
      [Documentation], [
        The product shall be documented with a user guide for the medical and IT staff.
      ],

    ),
    caption: "Top-level customer needs."
  )
]


== Key Stakeholders

#list(
  [
    _*Virginia Tech ECE*_

    Virginia Tech's Electrical and Computer Engineering department
    backs the project development.
    They provide the means of
    funding, reimbursements, equipment, and programs
    for the implementation of the product,
    all of which is only provided under justified reasons.
    They will also be associated with the final project's results,
    whether it'd be negative or positive.
    This stakeholder's primary assets are money and reputation.
  ],
  [
    _*Medical Staff*_

    The medical staff (e.g., nurses, doctors, volunteers) depend on the usability
    of the product.
    It is expected that the device will actually save time and effort in providing the care
    and is preferable to use rather than not.
    Aspects affecting the usability of the product
    includes the quality of documentation (e.g., user guide),
    effort of maintenance (e.g., replacing batteries),
    and ease of use (e.g., getting alerted).
    This stakeholder's primary assets are time, effort, and quality of care.

  ],
  [
    _*Marion duPont Scott Equine Medical Center*_

    The designed medical system,
    if approved by thorough testing and validation,
    will be used on patients under the care of the hospital.
    By the act of using it,
    the medical center's reputation is tied to the reliability of the product
    and is liable to any shortcomings that the product may have.
    This stakeholder's primary assets is the patient and reputation.
  ],
  [
    _*Equine Patient's Owner*_

    The equine patient is ultimately the property of the owner.
    It is in their best interest that the product is safe and secure.
    Safe meaning that the device does not further complicate the care of the patient,
    and secure in that the telemetry collected is entirely confidential between
    the owner and the medical center.
    This stakeholder's primary asset is the patient.
  ],
)




////////////////////////////////////////////////////////////////////////////////

= General Constraints

== External Factors - Global, Cultural, and Environmental

The external factor that affects the project the most is environmental.

The automated medical device operates in a \~6ft#super[2] to \~12ft#super[2] stall
environment within the Marion duPont Scott Equine Medical Center.
The stall can be bedded with pine shavings
and equipped with hay, water, grain buckets, mattresses, and other such amenities.
Previous studies have demonstrated that equine stall environments contain airborne particulate
matter generated from bedding materials and that horse activity can re-suspend these particles
into the surrounding air@nazarenko2018.
With this being the primary operating environment,
the product design shall take into account
the particulate matter coming from the bedding, forage, and fluids of the patient.
Specifically, these conditions impose constraints on
the electronic enclosure's robustness
and the long-term reliability of exposed sensor components.
These environmental considerations are reflected in system requirement ENV-1,
which requires the product to perform all functions within the expected environment of the
veterinary center.

The mechanical demands are also substantial.
A newborn foal can weigh 70 kg (154 lb)
and a mare 530 kg (1,168 lb) on the high-end@HEIDLER2004883.
The patient can move, roll, and shift position,
especially frequently if they're uncomfortable.
In this way, the harness and device must withstand
repeated flexing, impact, and vibration
while maintaining sensor accuracy.
Simultaneously,
the device's mechanical design should avoid imposing
unnecessary physical stress onto the patient
(e.g., batteries exerting pressure onto the ribs).
These considerations are reflected in system requirements ME-3 and ME-4, which require the harness of the product to be adjustable and flexible without restricting normal movement or causing discomfort.

The product design must also take into account
the hospital's existing infrastructure, culture, and workflow.
In particular,
the nursing staff need to be able to manually assess the patient's vitals
and upkeep patient care equipment
(e.g., provide milk through feeding tube, empty urine bags).
The regular routine of the nursing staff
can be incorporated into the product's design
(e.g., replacing batteries),
but in any case,
the product must not interfere
with the existing quality of care
that the medical center is already providing.
The automated monitoring system is an adjunct to,
not a replacement for,
the existing patient care routine.
The device must therefore be unobtrusive,
easy to attach and remove,
and reliable enough to earn sustained trust
without introducing issues such as alarm fatigue. System requirements ME-2 and ME-5 addresses these constraints, by requiring the product to minimize interference with the medical staff’s existing workflow and allow battery replacement to be performed by personnel with limited technical knowledge of the system.





////////////////////////////////////////////////////////////////////////////////

== Social Factors - Public Health, Safety, and Welfare

The development of the product
will be supported with practices
that promote public health, safety, and welfare.
The engineering team will take necessary safety measures,
such as wearing PPE and proper handling and disposal of chemicals,
to achieve this goal.
Relevant engineering safety guidelines will also be in effect,
particularly when it comes to testing the medical system on a live subject.

Other social factors are also at play. In particular, the patient is often in a vulnerable condition that can deteriorate rapidly,
and in the case of foals,
often express pain and distress differently from adult horses.
Above all other constraints, the safety and welfare of the patient is the main priority.
This factor then implies additional requirements
such the materials in contact with the animal being safe, non-irritating,
and not pose additional risks.
System requirement ME-3 account for these concerns, which require the harness and product to minimize risk of mechanical hazards including cuts by sharp edges or entanglement.
Overall, for the automated medical device to be effective,
the patient's unique attributes must be taken into account
and result in a product design that is adjustable.

The device must also capture and analyze vital signs
accurately enough in order to be a dependable and useful system (system requirement PER-1, PER-2, PER-3, PER-4, PER-5).
Specifically,
excessive false alarms
would lead to alarm fatigue
and thus desensitize staff to genuine alerts.
Conversely,
inaction to alert on legitimate issues
would be a failure in reducing the time and effort spent
on patient care on the medical staff's behalf.
These factors further call for a product design
that can be adapted and configured for each patient's condition
in order to be effective (system requirement CON-1).

The introduction of an automated monitoring device
also adds a new tool to the nursing staff's workflow
and imposes a training and maintenance burden.
This is a critical consideration to take into account
because a device that is difficult to use or understand
will either be underutilized or cause the staff to struggle to interpret its output,
both of which degrade patient safety.
To minimize the burden,
the product would be accompanied with a user guide
that is clear, task-oriented, and accessible to both the medical staff and IT staff.
Additionally,
the device would incorporate on-board self-diagnostics
(e.g., statuses on power, sensors, network)
so that a system failure/issue is more immediately visible to the staff (system requirement FUN-8).






//#todo[
//  Evaluate the external factors listed above as they related to your product/service. This section
//should be 3-5 paragraphs in length. Describe any lab safety practices that you will follow as well
//as safety standards in engineering design. Use references to the literature where applicable.
//Additionally, mention any customer requirements or target specifications that have been initiated
//based on this analysis and be sure that they are included in the tables below.
//]




== Ethical Factors - Global, Societal, Economic, and Environmental

//A focus on resourcefulness will also be held throughout the development of the product.
//Prototypes and multiple alternative designs will be made and validated,
//but only through the employment of IEEE's Principle 6#cite(<ieee2020code>)
//to ensure no unnecessary pressure is placed upon society and the environment.
//Acts of resourcefulness include designing for only minimal PCB revisions
//and minimal distinct component counts,
//both of which has the impact of reducing e-waste.

When it comes to ethical factors involved in the product's development,
three core principles of the IEEE code of ethics can be cited.

#v(1em)

#quote(block: true, attribution: [IEEE, @ieee2020code])[
  1\. to hold paramount the safety, health, and welfare of the public, to
  strive to comply with ethical design and sustainable development
  practices, to protect the privacy of others, and to disclose promptly
  factors that might endanger the public or the environment;
]

The product will directly interact and influence the patient's medical care.
With this in mind,
all design decisions and requirements will factor in the safety of the patient.
Any known shortcomings in the product design or implementation will be communicated to stakeholders.



#v(1em)

#quote(block: true, attribution: [IEEE, @ieee2020code])[
  5\. to seek, accept, and offer honest criticism of technical work,
  to acknowledge and correct errors, to be honest and realistic in
  stating claims or estimates based on available data, and to credit
  properly the contributions of others;
]

The team seek to validate designs that
will align with this requirements specification document,
both ethically and functionally.
This is achieved by upholding transparent communication with stakeholders
to ensure any gaps in understanding will always be resolved.

#v(1em)



#quote(block: true, attribution: [IEEE, @ieee2020code])[
  6\. to maintain and improve our technical competence and to undertake
  technological tasks for others only if qualified by training or experience,
  or after full disclosure of pertinent limitations;
]

The team can address and handle technical work that is relevant to the members' experiences and skill-sets,
but any task outside of the members' backgrounds will be dutifully assessed by qualified peers
(e.g., subject matter experts).
Work will only be done if it can be finished competently or with professional guidance.

#v(1em)


With these guiding principles stated,
the engineering team aims for a productive and ethical product design.
Transparent communication,
in particular,
will be the primary driving force throughout the development.
Achieving shared understanding of requirements
and upholding accountability can only be done through
frequent communication between the team, the stakeholders, and the members thereof.

#pagebreak()

== Use Case

#enum(
  [
    *Title*: \
    Continuous vital sign monitoring of a patient in intensive care.
  ],
  [
    *Primary Goal*: \
    The staff
    require continuous, non-invasive monitoring
    of a patient's heart rate,
    respiratory rate,
    and movement pattern.
    Additional monitoring such as ECG and respiratory pattern analysis
    will also be done if implemented and applicable.
    The system alerts the on-duty staff
    when a measured vital sign
    falls outside a configured nominal window
    or when a concerning movement pattern is detected.
  ],
  [
    *Actors*: \
    The primary actors are
    the nursing and veterinary technicians,
    who attach the device,
    monitor the desktop application,
    and respond to alerts.
    The patient, typically a foal or a mare, is the secondary actor.
    The on-call physician
    is a secondary actor
    who can potentially receives escalated alerts
    via the hospital's messaging system.
    The patient's owner
    is a stakeholder
    but not a direct actor in this use case.

  ],
  [
    *Preconditions*: \
    The patient requiring continuous monitoring
    is admitted and is under the supervision of the medical center.
    The device battery is charged.
    A nursing or veterinary technician
    is available to attach and set up the device.
    The hospital's Wi-Fi network
    covers the patient's stall.

  ],
  [
        *Trigger*:\
    A patient is admitted to intensive care
    and the treating team determines
    that continuous monitoring is applicable and warranted.
  ],
  [
    *Main Success Scenario (Normal Flow)*:\
    The technician attaches the sensor harness to the patient.
    The harness is adjustable to smaller profile of a foal
    or to the larger girth of a mare,
    depending on the patient.
    The nurse is still capable of carrying out other medical routines
    without being interfered by the device
    (e.g., still able to place a stethoscope underneath the harness for auscultation).

    The device powers on and begins acquiring vitals;
    on-board indicators confirm
    that power, sensors,
    and network connectivity are nominal.
    The telemetry is transmitted over Wi-Fi
    to the desktop application in real time.
    The system continuously monitors
    for any abnormalities.

    When an irregularity is detected,
    the system alerts the on-duty nursing staff.
    The nurse verifies the event and,
    if warranted, escalates to the on-call physician.
    The nurse dismisses the alert
    in the desktop application
    after confirming the patient has been assessed.
    At the end of the monitoring period,
    the nurse removes the harness
    and the device is set aside.
  ],
    [
    *Alternative Flows*:\
    #enum(
      spacing: 1em,
      [
        _Battery depletion._\
        The device alerts staff on low battery.
        The nurse swaps or recharges the battery
        during a routine stall entry.
        Monitoring resumes.
      ],
      [
        _Sensor disconnection._\
        A sensor module is removed
        or its connection is lost.
        The system continues to function
        with the remaining sensors
        and flags the disconnected sensor
        in the status indicators.
      ],
    )
  ],
  [
    *Exception Flows (Error Conditions)*:\
    #enum(
      spacing: 1em,
      [
        _False alarm._\
        A sensor is displaced
        or the measurement otherwise produces an invalid reading.
        The system alerts staff.
        The nurse assesses the patient,
        determines the event
        is not clinically significant,
        dismisses the alert,
        and repositions the sensor
        or reconfigures the device with an updated threshold.
      ],
      [
        _Network loss._\
        The Wi-Fi connection is interrupted.
        On-board system indicators signify a network error (e.g., red blinking LED).
        The desktop application indicates loss of connection to the device.
        The device nonetheless continues monitoring
        and resumes transmission when the connection is restored.
      ],
      [
        _Power loss._\
        The battery is depleted
        and not yet replaced.
        The device ceases monitoring.
        Staff are alerted
        by the low-battery warning
        or by the absence
        of expected telemetry
        in the desktop application.
      ],
    )
  ],
  [
    *Postconditions (Outcomes)*:\
    On success,
    the patient's vitals
    have been continuously monitored
    and any abnormalities
    have been assessed and resolved.
    The alert log in the desktop application
    reflects all events and their dispositions.

    On failure,
    the patient continues to receive care
    through the existing manual monitoring process;
    the device is repaired, reconfigured, or removed,
    and the incident is noted.
  ],
  [
    *Notes / Assumptions*:\
    #enum(
      spacing: 1em,
      [
        The power draw of the device will be optimized
        for a minimum 24-hour operating life.
        The device's battery is replaced or recharged daily
        by the nursing staff as part of routine care.
        The battery form factor will the same as one can find off-the-shelf
        (e.g., AAA, 9V, etc.);
        whether or not the batteries themselves
        are rechargeable is up to the medical staff.
      ],
      [
        A single harness can be designed to be adjustable
        for both a foal and a mare patient,
        but multiple variations of harnesses
        can also be designed if it is more practical this way.
        In this case,
        the electronics can be transferred and reused between harnesses.
      ],
    )
  ],
)




////////////////////////////////////////////////////////////////////////////////

#[
  #show figure: set block(breakable: true)
#page(flipped: true)[
  = Product Requirements

  == System Requirements
  #align(center)[
    #figure(
      {
        show table.cell: set text(size: 1.0em)
        table(
          columns : (4em, 5em, auto, auto),
          inset   : 6pt,
          align   : (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Req ID]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Priority]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Requirement]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Verification Type]],
          [FUN-1], [1],	[The system SHALL monitor heart rate.], [DEMONSTRATION],
          [FUN-2], [2], [The system SHOULD monitor heart rhythm through ECG.], [DEMONSTRATION],
          [FUN-3], [1], [The system SHALL monitor respiratory rate.], [DEMONSTRATION],
          [FUN-4], [2], [The system SHOULD monitor respiratory pattern.], [DEMONSTRATION],
          [FUN-5], [1], [The system SHALL measure patient movement.], [DEMONSTRATION],
          [FUN-6], [1], [The system SHALL notify relevant medical staff of warnings and errors.], [DEMONSTRATION],
          [FUN-7], [1], [The system SHALL be compatible with existing medical intranet systems. ], [DEMONSTRATION],
          [FUN-8], [2], [The system SHOULD include on-board self-diagnostics that display the status the statuses of power, sensors, and network.], [INSPECTION],
          [PER-1], [2], [The heart rate monitoring SHALL be within #sym.plus.minus;2 BPM compared to a commercial heart rate monitor product.], [TEST],
          [PER-2], [2], [The respiratory rate monitoring SHALL be within #sym.plus.minus;2 BrPM (breaths per min) compared to a commercial respiratory rate monitor.], [TEST],
          [PER-3], [1], [The movement monitoring system SHALL detect roll-onto-back events with at least 90% agreement compared to manual observation.], [TEST],
          [PER-4], [1], [The movement monitoring system SHALL detect when the horse's front legs are in front of its face with at least 90% agreement compared to manual observation. ], [TEST],
          [PER-5], [1], [The movement monitoring system SHALL detect laying/standing transitions with at least 90% agreement compared to manual observation.], [TEST],
          [PER-6], [1], [The system SHALL transmit an emergency alert within 60 seconds of detecting signs of distress.], [TEST],
          [PER-7], [3], [The system QoS MAY be in compliance with IEEE Std 11073-00101™-2008.], [TEST],
          [COM-1], [3], [The system SHALL not create electromagnetic interference with other medical equipment or IT systems (IEC 60601-1).], [ANALYSIS],
          [COM-2], [1], [The system SHALL comply with relevant veterinary and medical privacy regulations.], [ANALYSIS],
          [COM-3], [2], [The system SHALL have a maximum leakage current for normal and single fault conditions of 100uA and 500uA, respectively (IEC 60601-1).], [ANALYSIS],
          [ENV-1], [1], [The system SHALL perform all functions in the expected environment of the veterinary center.], [ANALYSIS],
          [REL-1], [1], [The system SHALL withstand impacts proportional to the mass of the patient.], [TEST],
          [REL-2], [1], [The firmware SHALL operate continuously for at least 7 days without crashing, freezing, unintended resetting, or manual power cycling.], [TEST],
          [POW-1], [1], [The system SHALL sustain on battery power for at least 1 day.], [TEST],
          [POW-2], [2], [The system SHALL alert staff on low battery power.], [TEST],
          [POW-3], [3], [The system SHOULD show the battery level on the GUI.], [TEST],
          [POW-4], [3], [The system SHOULD display the remaining battery time on the GUI.], [TEST],
          [ME-1], [1], [The product and harness SHALL minimize risk of mechanical hazards including cuts by sharp surfaces and entanglement.], [INSPECTION],
          [ME-2], [2], [Battery swap SHOULD be able to be performed by personnel with limited technical knowledge of the system.], [DEMONSTRATION],
          [ME-3], [1], [The harness SHALL be adjustable and flexible to accommodate varying foal sizes without restricting normal movement or causing discomfort.], [DEMONSTRATION],
          [ME-4 ], [1], [The harness SHALL NOT place excessive pressure onto the foals.], [DEMONSTRATION],
          [ME-5], [2], [The product SHOULD minimize interference to existing workflow of medical staff.], [DEMONSTRATION],
          [I/O-1], [2], [The medical system SHOULD still be functional without the heart rate monitor.], [TEST],
          [I/O-2], [2], [The medical system SHOULD still be functional without the EKG monitor.], [TEST],
          [I/O-3], [2], [The medical system SHOULD still be functional without the respiratory monitor.], [TEST],
          [I/O-4], [2], [The medical system SHOULD still be functional without the movement monitor.], [TEST],
          [I/O-5], [3], [The medical device SHOULD have indicators (e.g., LEDs, buzzers) to indicate the current device operating condition (e.g., battery level).], [DEMONSTRATION],
          [CON-1], [2], [The window for nominal vital sign parameters SHALL be configurable.], [DEMONSTRATION],

        )
      },
      caption: "Product requirements.",
    )
  ]
]
]


== Target Specifications



Assumptions made for @target-specifications:

#enum(
  spacing: 1em,
  [Sensors are assumed to be correctly positioned and securely attached to the foal during verification testing.],
  [Abnormal movement events the device is detecting only include front legs positioned in front of the foal's face, rolling on to the back, seizures, muscle fasciculations, and #sym.gt.eq 3 standing to lying and lying to standing transitions within 1 hour.],
  [Abnormal movement events will be verified using direct observation or recorded video during testing of the movement detection system of the device. ],
  [The reported abnormal movement detection accuracy assumes the system is tested using enough examples of both abnormal and normal foal movements to meaningfully evaluate performance.],
  [Commercially available heart-rate monitoring equipment will be used as a reference when evaluating the accuracy of the heart-rate monitoring system of the device. The respiratory rate monitoring system will be evaluated in a similar manner. ],
  [Emergency alert transmission time will be measured from the point at which the system identifies an abnormal condition to the point at which the alert is received by the intended receiving device.],
)


#page(flipped: true)[
  #align(center)[
    #figure(
      {
        show table.cell: set text(size: 0.85em)
        table(
          columns : (3em, 10em, 8em, auto, auto, 21em),
          inset   : 6pt,
          align   : (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),

          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Req \ ID]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Metric]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Units]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Marginal \ Value]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Target (Ideal) \ Value]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Traceability / Rationale]],

          [PER-1],
          [Heart rate monitoring accuracy compared to a commercial heart rate sensor.],
          [BPM],
          [#sym.plus.minus;5 BPM],
          [#sym.plus.minus;2 BPM],
          [Detect abnormal heart rate as a metric to alert medical staff. Device must be able to reliably send alerts.],

          [PER-2],
          [Respiratory rate monitoring accuracy compared to a commercial device.],
          [Breaths per Minute (BrPM)],
          [#sym.plus.minus;5 BrPM],
          [#sym.plus.minus;2 BrPM],
          [Detect abnormal breathing as a metric to alert medical staff. Device must be able to reliably send alerts.],

          [PER-3],
          [Detection of roll-onto-back events accuracy.],
          [Roll Angle (Degrees)],
          [0#sym.degree - 45#sym.degree \ 70#sym.degree - 110#sym.degree],
          [120#sym.degree - 145#sym.degree],
          [Measure the total degrees turned and if its standing (0#sym.degree - 45#sym.degree) or is in lateral recumbency (70#sym.degree - 110#sym.degree) have that be acceptable. If it gets it (150#sym.degree - 180#sym.degree) then trigger and send an alert. ],

          [PER-4],
          [Detection of abnormal front leg behavior accuracy.],
          [N/A],
          [80%],
          [90%],
          [One of the foal's signs of distress is rubbing their face with their front legs. Device must be able to reliably detect this front leg behavior.],

          [PER-5],
          [Detection of standing to lying and lying to standing transitions accuracy.],
          [N/A],
          [80%],
          [90%],
          [Detect how many times the horses stand within a given hour. According to the client, if a foal stands more than three times within the hour, it means there is discomfort and attention is needed.],

          [PER-6],
          [Transmitting an emergency alert in a timely manner.],
          [Seconds],
          [90s],
          [60s],
          [Detect abnormal foal conditions and send a signal to alert medical staff in a timely manner.],

          [POW-1],
          [Battery life per usage.],
          [Time],
          [12 Hours],
          [1 Day],
          [Battery must power the device for as long as a typical medical staff shift to avoid having constant battery changes.]
        )
      },
      caption: "Target specifications.",
    ) <target-specifications>
  ]
]


#page(flipped: true)[

  #align(center)[
    #figure(
      {
        show table.cell: set text(size: 1.0em)
        table(
          columns : (4em, auto, 10em, auto),
          inset   : 6pt,
          align   : (center + horizon, center + horizon, center + horizon, center + horizon),

          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Req. \#]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Requirement]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Source Document]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Details]],

          [COM-1],
          [The system SHALL not create electromagnetic interference with other medical equipment or IT systems.],
          [IEC 60601-1],
          [General requirements and tests for electromagnetic emissions and electromagnetic immunity of medical electrical equipment.],

          [COM-2],
          [The system SHALL comply with relevant veterinary and medical privacy regulations.],
          [VMCVM and \ University Policies],
          [Section 6: policies governed by the VT Vet Med school which include protecting the confidentiality and dignity of veterinary patients.],

          [COM-3],
          [The system SHALL have a maximum leakage current for normal and single fault conditions of 100uA and 500uA, respectively.],
          [IEC 60601-1],
          [Clause 8.7.3 specifies the allowable values for leakage currents and patient auxiliary currents under both normal conditions and single fault conditions to protect patients and operators from electrical shock.],

        )
      },
      caption: "Standards and statutory requirements."
    )
  ]
]


#page(flipped: true)[
  == Benchmarking Information

  #align(center)[
    #figure(
      {
        show table.cell: set text(size: 0.9em)
        table(
          columns : (auto, auto, auto, auto, auto),
          inset   : 6pt,
          align   : (center + horizon, center + horizon, center + horizon, center + horizon),

          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Feature / Requirement]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Target Requirement]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Existing Alternative \#1]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Existing Alternative \#2]],
          table.cell(fill: maroon)[#text(fill: white, weight: "bold")[Existing Alternative \#3]],



          [*FUN-1* \ Measuring heart rate],
          [Accurately measuring the heart rate of the foal.],
          [Single lead ECG placed on the foal.],
          [Wearable PPG sensor placed near the base of the tail.],
          [Wearable ECG mounted electrodes.],

          [*FUN-3* \ Measuring respiratory rate],
          [Accurately measuring the respiratory rate of the foal.],
          [Nasal airflow, temperature sensing, or audio processing.],
          [Plethysmography via impedance or resistive measurement.],
          [Ultrasound.],

          [*FUN-5* \ Abnormal movement \ detection],
          [Detect concerning behaviors such as rolling on back, front limbs up by the face, +3 standing/lying transitions per hour, and rapid twitching/fasciculations.],
          [Computer Vision used to detect subtle movement and changes in posture.],
          [Triaxial accelerometer attached near the tail of the foal to measure orientation and movement.],
          [Accelerometer + machine learning colic detection used to detect normal and pain-related movement patterns.],

          [*FUN-6* \ Transmitting \ emergency alerts],
          [Mobile alert sent to nursing staff when monitored biometric parameter(s) goes out of range or abnormal movement detected.],
          [Internal emergency messaging system (Doc Halo) sends alerts directly to the doctor.],
          [Sends an SMS/Text message to nursing staff when abnormal activity is detected.],
          [Through the Website GUI interface, it will have a small alert that would need to be dismissed when an alert goes off.],

          [*ME-3* \ Harness flexibility \ and comfortability],
          [Device must be flexible, comfortable, and noninvasive for the foals.],
          [Surcingle.],
          [Full body suit \ (i.e., "slinky").],
          [Halter or head \ collar mounted device.],

        )
      },
      caption: "Benchmarking information."
    )
  ]
]


#pagebreak()



////////////////////////////////////////////////////////////////////////////////

= References

#bibliography("refs.bib", title: none, full: true, style: "ieee")

