// The module 'vscode' contains the VS Code extensibility API

const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mytemplate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable_for_setting_template = vscode.commands.registerCommand('mytemplate', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'myTemplate', // Identifies the type of the webview. Used internally
			'My Template', // Title of the panel displayed to the user
			vscode.ViewColumn.Active, // Editor column to show the new webview panel in.
			{
				enableScripts: true, // Allow JavaScript execution
				retainContextWhenHidden: false, // Do not retain context when hidden

			} // Webview options. More on these later.
		);


		panel.webview.html = getWebviewContentForTemplate();

		panel.webview.onDidReceiveMessage(
			(message) => {
			  if (message.type === 'submitForm') {
				
				var storageUri = context.globalStorageUri;// Use global storage URI
				var storagePath = path.join(storageUri.fsPath, 'mytemplate');
				if (!fs.existsSync(storagePath)) {
					fs.mkdirSync(storagePath, { recursive: true });  // Create directory if not exists
				}
		  
				const filePath = path.join(storagePath, 'mytemplate.json');  // File path for data
				fs.writeFileSync(filePath, JSON.stringify(message.data, null, 2));
				
				// Store data in VSCode's global state or workspace state
				// context.globalState.update('templateName', templateName);
				// context.globalState.update('template', template);
		  
				// // You can also perform additional tasks here
				// console.log(`Received data: ${templateName}, ${template}`);
				vscode.window.showInformationMessage('sucessfully stored data');
				console.log('sucessfully stored data');
			  }
			},
			null,
			context.subscriptions
		  );

		panel.onDidDispose(
			() => {
				console.log("Webview panel closed, clearing resources");
			},
			null,
			context.subscriptions
		)
		// panel.webview.html = getWebviewContentForTemplate();
		// vscode.window.showInformationMessage('Hello duniya from myTemplate!');
		vscode.window.showInformationMessage('Change the command succesfully 😎');
	});

	context.subscriptions.push(disposable_for_setting_template);

	let disposable_for_getting_temple = vscode.commands.registerCommand('usemytemplate', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'useMyTemplate', // Identifies the type of the webview. Used internally
			'Use My Template', // Title of the panel displayed to the user
			vscode.ViewColumn.Active, // Editor column to show the new webview panel in.
			{
				enableScripts: true
			} // Webview options. More on these later.
		);

		panel.webview.html = getTemplateByInputField();

		var result = '';
		panel.webview.onDidReceiveMessage(
			(message) => {
				if (message.type == 'searchKey') {
					var fileData = getFileResult(context);
					if (fileData.length > 0)
						result = fileData[message.key];
					result = fileData['template'];
					panel.webview.postMessage({type: 'displayResult', value: result})
					vscode.window.showInformationMessage('Data showed');
				}
			}
		);
		vscode.window.showInformationMessage('extension activated');
		
	});

	context.subscriptions.push(disposable_for_setting_template);
}


function getFileResult(context) {
	const storageUri = context.globalStorageUri;
	const storagePath = path.join(storageUri.fsPath, 'mytemplate');
	const filePath = path.join(storagePath, 'mytemplate.json');
	if (fs.existsSync(filePath)) { // Check if the file exists
		let fileData = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(fileData.toString()); // Read and parse JSON file
		
	}
	else return [];
}

// This method is called when your extension is deactivated
function deactivate() {}

function getWebviewContentForTemplate() {
	return `
	  <html>
		<body>
		  <form id="dataForm" onsubmit="submitForm(event)">
			<label for="templateName">Template Name:</label>
			<input type="text" id="templateName" name="templateName" required><br><br>
  
			<label for="template">Template:</label>
			<textarea id="template" name="template" rows="10" cols="100"></textarea><br><br>
  
			<button type="submit">Submit</button>
		  </form>
  
		  <script>
			const vscode = acquireVsCodeApi(); // Acquire VSCode API to send messages
  
			function submitForm(event) {
			  event.preventDefault();
  
			  const form = document.getElementById('dataForm');
			  const formData = {
				templateName: form.templateName.value,
				template: form.template.value,
			  };
  
			  vscode.postMessage({ type: 'submitForm', data: formData });
			}
		  </script>
		</body>
	  </html>
	`;
  }

  function getTemplateByInputField() {
	return `
    <html>
      <body>
        <form id="keyForm" onsubmit="searchKey(event)"> <!-- Prevent default form submission -->
          <label for="keyInput">Enter Key:</label>
          <input type="text" id="keyInput" name="keyInput" placeholder="Enter a key" required><br><br>

          <button type="submit">Search</button>
        </form>

        <div id="output"></div> <!-- Output area for displaying results -->

        <script>
          const vscode = acquireVsCodeApi(); // Acquire VSCode API for messaging

          function searchKey(event) {
            event.preventDefault(); // Prevent default form submission
            const key = document.getElementById('keyInput').value; // Get the value from the input
            vscode.postMessage({ type: 'searchKey', key: key }); // Send to extension
          }

          // Handle messages and update the DOM
          window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'displayResult') {
              const outputElement = document.getElementById('output');
              outputElement.innerText = message.value; // Display the result in the webview
            }
          });
        </script>
      </body>
    </html>
  `;
  }
  
  
module.exports = {
	activate,
	deactivate
}
