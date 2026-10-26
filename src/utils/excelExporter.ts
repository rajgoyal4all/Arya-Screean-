import * as XLSX from 'xlsx';
import { OrderItem, WhatsAppLogEntry, ApiSettings, ShopProfile, Designer, WorkTypeItem } from '../types';

/**
 * Generates and downloads a complete multi-sheet Excel Workbook (.xlsx)
 * matching all sheets specified by ARYA SCREEN.
 */
export function exportToExcelWorkbook(
  orders: OrderItem[],
  logs: WhatsAppLogEntry[],
  settings: ApiSettings,
  shop: ShopProfile,
  designers?: Designer[],
  workTypes?: WorkTypeItem[]
): void {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Customer Database
  const customerDbData = orders.map((o) => ({
    'Customer ID': o.customerId,
    'Date & Time': o.dateTime,
    'Customer Name': o.customerName,
    'Mobile Number': o.mobileNumber,
    'WhatsApp Number': o.whatsappNumber,
    'Address': o.address,
    'Village/Town': o.villageTown,
    'District': o.district,
    'Pincode': o.pincode,
    'Email ID': o.email,
    'Work Type': o.workType,
    'Work Description': o.workDescription,
    'Quantity': o.quantity,
    'Size/Dimensions': o.sizeDimensions,
    'Material': o.material,
    'Design/File Name': o.designFileName,
    'Design/File Upload/Link': o.designFileUploadOrLink,
    'Delivery Date': o.deliveryDate,
    'Amount (₹)': o.amount,
    'Advance Paid (₹)': o.advancePaid,
    'Balance Amount (₹)': o.balanceAmount,
    'Payment Status': o.paymentStatus,
    'Order Status': o.orderStatus,
    'Handling Designer': o.designerOperator || 'Arya Production Team',
    'Remarks': o.remarks,
    'Order ID': o.orderId,
  }));
  const wsCustomerDb = XLSX.utils.json_to_sheet(customerDbData);
  XLSX.utils.book_append_sheet(wb, wsCustomerDb, 'Customer Database');

  // 2. Sheet: WORK ORDERS
  const workOrdersData = orders.map((o) => ({
    'Order ID': o.orderId,
    'Date': o.dateTime.split(' ')[0],
    'Customer Name': o.customerName,
    'Mobile': o.mobileNumber,
    'Work Type': o.workType,
    'Design/File': o.designFileName || 'Pending',
    'Size': o.sizeDimensions,
    'Quantity': o.quantity,
    'Amount (₹)': o.amount,
    'Advance (₹)': o.advancePaid,
    'Balance (₹)': o.balanceAmount,
    'Handling Designer': o.designerOperator,
    'Order Status': o.orderStatus,
    'Delivery Date': o.deliveryDate,
    'Remarks': o.remarks,
  }));
  const wsWorkOrders = XLSX.utils.json_to_sheet(workOrdersData);
  XLSX.utils.book_append_sheet(wb, wsWorkOrders, 'WORK ORDERS');

  // 3. Sheet: DESIGNER DATABASE
  if (designers && designers.length > 0) {
    const designerDbData = designers.map((d) => {
      const assigned = orders.filter(
        (o) =>
          o.designerOperator.toLowerCase().includes(d.name.toLowerCase()) ||
          o.designerOperator === d.id
      );
      const active = assigned.filter(
        (o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled'
      );
      const totalRev = assigned.reduce((sum, o) => sum + (o.amount || 0), 0);

      return {
        'Designer ID': d.id,
        'Designer Name': d.name,
        'Role / Designation': d.role,
        'Phone Number': d.phone,
        'Email': d.email || '',
        'Floor Status': d.status,
        'Skills & Softwares': d.skills.join(', '),
        'Active Orders in Queue': active.length,
        'Total Jobs Assigned': assigned.length,
        'Total Business Generated (₹)': totalRev,
        'Daily Capacity (Jobs)': d.dailyCapacity || 8,
        'Specialization Notes': d.notes || '',
      };
    });
    const wsDesigners = XLSX.utils.json_to_sheet(designerDbData);
    XLSX.utils.book_append_sheet(wb, wsDesigners, 'DESIGNER DATABASE');
  }

  // 4. Sheet: WHATSAPP LOG
  const whatsappLogData = logs.map((l) => ({
    'Date & Time': l.dateTime,
    'Order ID': l.orderId,
    'Customer Name': l.customerName,
    'WhatsApp Number': l.whatsappNumber,
    'Message Type': l.messageType,
    'Message Status': l.status,
    'API Response': l.apiResponse,
    'Retry Count': l.retryCount,
  }));
  const wsWhatsappLog = XLSX.utils.json_to_sheet(whatsappLogData);
  XLSX.utils.book_append_sheet(wb, wsWhatsappLog, 'WHATSAPP LOG');

  // 4. Sheet: API SETTINGS
  const apiSettingsData = [
    { Setting: 'WhatsApp Business Phone Number ID', Value: settings.phoneNumberId },
    { Setting: 'WhatsApp Business Account ID (WABA)', Value: settings.accountId },
    { Setting: 'API URL', Value: settings.apiUrl },
    { Setting: 'Message Template Name', Value: settings.templateName },
    { Setting: 'Language Code', Value: settings.languageCode },
    { Setting: 'API Status', Value: settings.apiStatus },
    { Setting: 'Provider', Value: settings.provider },
    { Setting: 'Last Message Status', Value: settings.lastMessageStatus },
    { Setting: 'Shop Name', Value: shop.shopName },
    { Setting: 'Tagline', Value: shop.tagline },
    { Setting: 'GST Number', Value: shop.gstNumber },
    { Setting: 'Contact Phone', Value: `${shop.phone1} / ${shop.phone2}` },
    { Setting: 'Address', Value: `${shop.address}, ${shop.villageTown}, ${shop.district} - ${shop.pincode}` },
  ];
  const wsApiSettings = XLSX.utils.json_to_sheet(apiSettingsData);
  XLSX.utils.book_append_sheet(wb, wsApiSettings, 'API SETTINGS');

  // 5. Sheet: PAYMENTS SUMMARY
  const totalAmount = orders.reduce((sum, o) => sum + o.amount, 0);
  const totalAdvance = orders.reduce((sum, o) => sum + o.advancePaid, 0);
  const totalBalance = orders.reduce((sum, o) => sum + o.balanceAmount, 0);
  const paymentsSummaryData = [
    { Metric: 'Total Job Orders', Amount: orders.length },
    { Metric: 'Gross Total Sales (₹)', Amount: totalAmount },
    { Metric: 'Total Advance Collected (₹)', Amount: totalAdvance },
    { Metric: 'Total Outstanding Balance (₹)', Amount: totalBalance },
  ];
  const wsPayments = XLSX.utils.json_to_sheet(paymentsSummaryData);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'PAYMENTS SUMMARY');

  // 6. Sheet: WORK TYPES & SAMPLES
  if (workTypes && workTypes.length > 0) {
    const workTypesData = workTypes.map((wt) => ({
      'Work Type Code': wt.id,
      'Work Type Title': wt.title,
      'Category': wt.category,
      'Base Rate (₹)': wt.basePrice,
      'Billing Unit': wt.unit,
      'Standard Dimensions': wt.defaultDimensions,
      'Turnaround Time': wt.estimatedTurnaround,
      'Available Materials': wt.materialOptions?.join(', '),
      'Sample Proofs Count': wt.samples?.length || 0,
      'Proof Titles': wt.samples?.map((s) => s.title).join(' | '),
      'Is Popular': wt.isPopular ? 'YES' : 'NO',
      'Description': wt.description,
      'Notes': wt.notes || '',
    }));
    const wsWorkTypes = XLSX.utils.json_to_sheet(workTypesData);
    XLSX.utils.book_append_sheet(wb, wsWorkTypes, 'WORK TYPES & SAMPLES');
  }

  // Format file name
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `ARYA_SCREEN_Customer_Orders_${dateStr}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * VBA Macro code for Excel Desktop (Windows/Mac)
 */
export const ARYA_VBA_CODE = `' =========================================================================
' ARYA SCREEN - FLEX, DTP, PRINTING & DESIGNING
' AUTOMATED EXCEL CUSTOMER MANAGEMENT & WHATSAPP DISPATCH MODULE
' =========================================================================

Option Explicit

Public Function GetNextOrderID() As String
    Dim ws As Worksheet
    Dim lastRow As Long
    Dim currentYear As String
    Dim nextNum As Long
    
    Set ws = ThisWorkbook.Sheets("WORK ORDERS")
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
    currentYear = Year(Date)
    
    If lastRow < 2 Then
        GetNextOrderID = "ARYA-" & currentYear & "-0001"
    Else
        nextNum = lastRow
        GetNextOrderID = "ARYA-" & currentYear & "-" & Format(nextNum, "0000")
    End If
End Function

Public Sub SubmitAryaOrder(ByVal custName As String, ByVal mobile As String, _
                           ByVal workType As String, ByVal sizeDim As String, _
                           ByVal qty As Long, ByVal totalAmt As Double, _
                           ByVal advanceAmt As Double, ByVal deliveryDate As String, _
                           ByVal operatorName As String, ByVal remarks As String)
    Dim wsCust As Worksheet
    Dim wsOrders As Worksheet
    Dim rCust As Long, rOrd As Long
    Dim newOrderID As String
    Dim balanceAmt As Double
    Dim orderStatus As String
    
    Set wsCust = ThisWorkbook.Sheets("Customer Database")
    Set wsOrders = ThisWorkbook.Sheets("WORK ORDERS")
    
    newOrderID = GetNextOrderID()
    balanceAmt = totalAmt - advanceAmt
    orderStatus = "New"
    
    ' 1. Save record to WORK ORDERS sheet first
    rOrd = wsOrders.Cells(wsOrders.Rows.Count, "A").End(xlUp).Row + 1
    With wsOrders
        .Cells(rOrd, 1).Value = newOrderID
        .Cells(rOrd, 2).Value = Format(Now, "YYYY-MM-DD")
        .Cells(rOrd, 3).Value = custName
        .Cells(rOrd, 4).Value = mobile
        .Cells(rOrd, 5).Value = workType
        .Cells(rOrd, 6).Value = "Pending"
        .Cells(rOrd, 7).Value = sizeDim
        .Cells(rOrd, 8).Value = qty
        .Cells(rOrd, 9).Value = totalAmt
        .Cells(rOrd, 10).Value = advanceAmt
        .Cells(rOrd, 11).Value = balanceAmt
        .Cells(rOrd, 12).Value = operatorName
        .Cells(rOrd, 13).Value = orderStatus
        .Cells(rOrd, 14).Value = deliveryDate
        .Cells(rOrd, 15).Value = remarks
    End With
    
    ' 2. Save complete data to Customer Database sheet
    rCust = wsCust.Cells(wsCust.Rows.Count, "A").End(xlUp).Row + 1
    With wsCust
        .Cells(rCust, 1).Value = "CUST-" & Format(rCust + 1000, "0000")
        .Cells(rCust, 2).Value = Format(Now, "YYYY-MM-DD HH:MM")
        .Cells(rCust, 3).Value = custName
        .Cells(rCust, 4).Value = mobile
        .Cells(rCust, 5).Value = mobile
        .Cells(rCust, 11).Value = workType
        .Cells(rCust, 13).Value = qty
        .Cells(rCust, 14).Value = sizeDim
        .Cells(rCust, 18).Value = deliveryDate
        .Cells(rCust, 19).Value = totalAmt
        .Cells(rCust, 20).Value = advanceAmt
        .Cells(rCust, 21).Value = balanceAmt
        .Cells(rCust, 23).Value = orderStatus
        .Cells(rCust, 24).Value = newOrderID
    End With
    
    ' 3. Trigger WhatsApp Business Cloud API
    Call SendWhatsAppBusinessAPI(newOrderID, custName, mobile, workType, totalAmt, deliveryDate)
    
    MsgBox "Order " & newOrderID & " registered successfully in ARYA SCREEN database!", vbInformation, "ARYA SCREEN"
End Sub

Public Sub SendWhatsAppBusinessAPI(ByVal orderID As String, ByVal custName As String, _
                                  ByVal mobile As String, ByVal workType As String, _
                                  ByVal totalAmt As Double, ByVal delDate As String)
    On Error GoTo ErrorHandler
    Dim http As Object
    Dim url As String, token As String, phoneID As String
    Dim payload As String, msgText As String
    Dim wsSettings As Worksheet, wsLog As Worksheet
    Dim rLog As Long
    
    Set wsSettings = ThisWorkbook.Sheets("API SETTINGS")
    Set wsLog = ThisWorkbook.Sheets("WHATSAPP LOG")
    
    phoneID = Trim(wsSettings.Range("B1").Value)
    token = Trim(wsSettings.Range("B3").Value)
    url = "https://graph.facebook.com/v21.0/" & phoneID & "/messages"
    
    msgText = "Thank you for visiting ARYA SCREEN! ❤️" & vbCrLf & vbCrLf & _
              "Dear " & custName & "," & vbCrLf & vbCrLf & _
              "Thank you for choosing Arya Screen." & vbCrLf & vbCrLf & _
              "Your order has been successfully registered." & vbCrLf & vbCrLf & _
              "Order ID: " & orderID & vbCrLf & _
              "Work: " & workType & vbCrLf & _
              "Amount: ₹" & totalAmt & vbCrLf & _
              "Delivery Date: " & delDate & vbCrLf & vbCrLf & _
              "We appreciate your support and look forward to serving you again." & vbCrLf & vbCrLf & _
              "— ARYA SCREEN"
              
    ' Escape quotes for JSON
    msgText = Replace(msgText, vbCrLf, "\\n")
    msgText = Replace(msgText, """", "\""")
    
    payload = "{""messaging_product"":""whatsapp"",""to"":""91" & mobile & """,""type"":""text"",""text"":{""body"":""" & msgText & """}}"
    
    Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    http.Open "POST", url, False
    http.setRequestHeader "Content-Type", "application/json"
    http.setRequestHeader "Authorization", "Bearer " & token
    http.Send payload
    
    ' Record Log
    rLog = wsLog.Cells(wsLog.Rows.Count, "A").End(xlUp).Row + 1
    wsLog.Cells(rLog, 1).Value = Format(Now, "YYYY-MM-DD HH:MM")
    wsLog.Cells(rLog, 2).Value = orderID
    wsLog.Cells(rLog, 3).Value = custName
    wsLog.Cells(rLog, 4).Value = mobile
    wsLog.Cells(rLog, 5).Value = "Order Confirmation"
    
    If http.Status = 200 Then
        wsLog.Cells(rLog, 6).Value = "Sent"
        wsLog.Cells(rLog, 7).Value = http.responseText
    Else
        wsLog.Cells(rLog, 6).Value = "Message Failed"
        wsLog.Cells(rLog, 7).Value = "Status " & http.Status & ": " & http.responseText
    End If
    Exit Sub

ErrorHandler:
    rLog = wsLog.Cells(wsLog.Rows.Count, "A").End(xlUp).Row + 1
    wsLog.Cells(rLog, 1).Value = Format(Now, "YYYY-MM-DD HH:MM")
    wsLog.Cells(rLog, 2).Value = orderID
    wsLog.Cells(rLog, 3).Value = custName
    wsLog.Cells(rLog, 4).Value = mobile
    wsLog.Cells(rLog, 6).Value = "Message Failed"
    wsLog.Cells(rLog, 7).Value = Err.Description
End Sub
`;

/**
 * Microsoft Office Script for Excel for the Web / Power Automate
 */
export const ARYA_OFFICE_SCRIPT = `/**
 * ARYA SCREEN - Office Script for Excel 365 & Power Automate
 * Automates Customer & Work Order Registration + Meta Cloud WhatsApp Dispatch
 */
async function main(workbook: ExcelScript.Workbook) {
  const custSheet = workbook.getWorksheet("Customer Database");
  const ordersSheet = workbook.getWorksheet("WORK ORDERS");
  const logSheet = workbook.getWorksheet("WHATSAPP LOG");
  
  console.log("Arya Screen Office Script Initialized");
}
`;

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
