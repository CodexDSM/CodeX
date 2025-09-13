import { Card } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import styles from './login.module.css'



export default function LoginPage() {
    const locaisSelect = [
    { value: 'home_office', label: 'Home Office' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'evento', label: 'Evento/Treinamento' }
    ]
    return (
    <main className={styles.mainContainer}>
        <Card>
            <div className={styles.contentWrapper}>
                <h1 className={styles.title}>Login</h1> 
                <Input
                    label='CPF'
                    placeholder= "Digite apenas Numeros"
                />   
                
                <Input
                    label= 'Senha'
                    placeholder= '**********'
                />

                <Select 
                    label='Local de Trabalho'
                    options={locaisSelect}
                />
                   
                
                    
                    
            
                <div className={styles.buttonContainer}>
                    <Button variant="primary"> Entrar </Button>
                    <Button variant="secondary">Formularios</Button>
                </div>               
            </div>
        </Card>
    </main>
    )

}

