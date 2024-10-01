
  const [prompt, setPrompt] = useState<string>('')
  const completion = async () => {
    const response = await getLlamaCompletion(prompt)
    return response
    console.log(response)
  }
