import CadastroEvento from "@/components/layout/EventosForm"
import { CardContent } from "@/components/ui/card"
import styles from "./novo.module.css"
export default function PageNovo () {
    return (
        <div className= {styles.container}>

               
                    <CadastroEvento></CadastroEvento>

              
        </div>
            

    )
}