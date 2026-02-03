import {
	ThemeProvider,
	createTheme,
	CssBaseline,
	Container,
} from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UsageRecordsPage from './pages/UsageRecordsPage';

const theme = createTheme();

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<Container maxWidth='lg' sx={{ py: 2 }}>
					<Routes>
						<Route path='/' element={<UsageRecordsPage />} />
					</Routes>
				</Container>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;
